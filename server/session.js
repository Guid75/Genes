var
Player = require('./player.js').Player,
_ = require('underscore'),
util = require('util'),
events = require('events');

var maxPlayers = 5;
var maxSpectators = 100;

var generatedPlayerNamePrefix = 'Player';

var Session = function(config) {
	config = config || {};

	this.running = false;
	this.players = [];
	this.everybody = [];

	// all the game elements
	this.board = undefined;
	this.auctionTable = undefined;
	this.infoBoard = undefined;
	this.geneBag = undefined;
	this.eventCards = undefined;
	this.pawns = undefined; // dinosaurs
};

util.inherits(Session, events.EventEmitter);

Session.prototype.playersCount = function() { return this.players.length; };
Session.prototype.spectatorsCount = function() { return this.everybody.length - this.players.length; };
Session.prototype.isRunning = function() { return this.running; };
Session.prototype.fullOfPlayers = function() { return this.players.length === maxPlayers; };
Session.prototype.fullOfSpectators = function() { return this.spectatorsCount() === maxSpectators; };
Session.prototype.isRunnable = function() { return this.players.length >= 3; }; // if we have the right count of players to start a game session

Session.prototype.createUniquePlayerName = function() {
	var i, j, name, player, found, len = this.everybody.length;
	for (i = 1; i <= len; i++) {
		name = util.format('%s_%d', generatedPlayerNamePrefix, i);
		found = false;
		for (j = 0; j < len; j++) {
			if (this.everybody[j].name.toLowerCase() === name.toLowerCase()) {
				found = true;
				break;
			}
		}
		if (!found) {
			return name;
		}
	}
	return util.format('%s_%d', generatedPlayerNamePrefix, len + 1);
};

Session.prototype.addPlayer = function(config) {
	var player, socket, spectator;
	config = config || {};
	if (!config.socket) {
		throw new Error('Session.addPlayer(): no socket provided');
	}
	socket = config.socket;

	if (config.spectator) {
		if (this.fullOfSpectators()) {
			socket.emit('KO', {
				message: 'session has reached its maximum amount of spectators'
			});
			return false;
		}
		spectator = true;
		player = new Player({
			socket: config.socket
		});
	} else {
		if (this.running) {
			socket.emit('KO', {
				message: 'game has been started'
			});
			return false;
		}
		if (this.fullOfPlayers()) {
			socket.emit('KO', {
				message: 'session has reached its maximum amount of players'
			});
			return false;
		}
		this.players.push(player = new Player({
			socket: config.socket
		}));
	}
	player.name = this.createUniquePlayerName();
	this.everybody.push(player);
	socket.emit('OK', { message: util.format('you successfully joined the session. Your name is "%s"', player.name) });
	this.broadcast({
		blacklist: player,
		type: 'session',
		data: {
			event: 'newplayer',
			name: player.name,
			spectator: spectator
		}
	});

	this.emit('newplayer', this, {
		name: player.name,
		spectator: spectator
	});

	return true;
};

Session.prototype.broadcast = function(config) {
	var
	i,
	len = this.everybody.length,
	player,
	blacklist = [];

	config = config || {};
	if (config.blacklist) {
		blacklist = _.isArray(config.blacklist) ? config.blacklist : [ config.blacklist ];
	}

	for (i = 0; i < len; i++) {
		player = this.everybody[i];
		if (blacklist.indexOf(player) < 0) {
			player.socket.emit(config.type, config.data);
		}
	}
};

Session.prototype.getPlayerBySocket = function(socket) {
	var foundPlayer;
	this.everybody.every(function(player) {
		if (player.socket === socket) {
			foundPlayer = player;
			return false;
		}
	});
	return foundPlayer;
};

Session.prototype.removePlayer = function(socket) {
	var i, len = this.everybody.length, player, index, spectator;
	for (i = 0; i < len; i++) {
		player = this.everybody[i];
		if (player.socket === socket) {
			this.everybody.splice(i, 1);
			index = this.players.indexOf(player);
			if (!(spectator = index < 0)) {
				this.players.splice(index, 1);
			}
			this.emit('delplayer', this, {
				name: player.name,
				spectator: spectator
			});
			return;
		}
	}
};

Session.prototype.treatGameEvent = function(socket, data) {
	var player = this.getPlayerBySocket(socket);
	if (!player) {
		throw new Error("no player found for the socket argument");
	}
	if (data.action === 'start') {
		this.start();
	}
};

var prepareInitiativePhase = function(session) {
	var
	maxTailLen = -1,
	largeTailplayers;
	_.each(session.players, function(player, index) {
		var tailLen = player.getGeneCount('tail');
		if (tailLen > maxTailLen) {
			maxTailLen = tailLen;
			largeTailPlayers = [ index ];
		} else if (tailLen === maxTailLen) {
			largeTailPlayers.push(index);
		}
	});

	if (largeTailPlayers.length === 1) {
	}
};

var prepareWeatherPhase = function(session) {
	// TODO
};

var prepareMoveAndFightPhase = function(session) {
	// TODO
};

var prepareBirthsPhase = function(session) {
	// TODO
};

var prepareMeteoritePhase = function(session) {
	// TODO
};

var preparePhase = function(session) {
	switch (session.phase) {
	case 1:
		prepareInitiativePhase(session);
		break;
	case 2:
		prepareWeatherPhase(session);
		break;
	case 3:
		prepareMoveAndFightPhase(session);
		break;
	case 4:
		prepareBirthsPhase(session);
		break;
	case 5:
		prepareMeteoritePhase(session);
		break;
	default:
		// TODO: raise an error
		break;
	}
};

var initTurn = function(session) {
	session.phase = 1;
	preparePhase(session);
};

Session.prototype.start = function() {
	// init all data structure
	this.geneBag = {
		card: 6,
		tail: 6,
		mutant: 6,
		umbrella: 8,
		egg: 8,
		fur: 8,
		horn: 8,
		leg: 12
	};

	this.turn = 1;
	initTurn(this);
};

exports.Session = Session;
