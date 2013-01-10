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

var sendMessage = function(socket, event, message) {
	if (socket) {
		socket.emit(event, { message: message });
	} else {
		if (event === 'KO')
			console.error('error: ' + message);
		else
			console.log(message);
	}
};

Session.prototype.addPlayer = function(config) {
	var
	player;

	config = config || {};
	if (!config.isBot && !config.socket) {
		throw new Error('Session.addPlayer(): no socket provided');
	}

	// can the player join?
	if (config.spectator) {
		if (this.fullOfSpectators()) {
			sendMessage(config.socket, 'KO', 'session has reached its maximum amount of spectators');
			return false;
		}
	} else {
		if (this.running) {
			sendMessage(config.socket, 'KO', 'game has been started');
			return false;
		}
		if (this.fullOfPlayers()) {
			sendMessage(config.socket, 'KO', 'session has reached its maximum amount of players');
			return false;
		}
	}

	// player is accepted!
	player = new Player({
		socket: config.socket,
		isBot: config.isBot,
		name: config.name || this.createUniquePlayerName()
	});
	this.everybody.push(player);
	if (!config.spectator)
		this.players.push(player);
	sendMessage(config.socket, 'OK', util.format('you successfully joined the session. Your name is "%s"', player.name));
	this.broadcast({
		blacklist: player,
		type: 'session',
		data: {
			event: 'newplayer',
			name: player.name,
			spectator: !!config.spectator
		}
	});

	this.emit('newplayer', this, {
		name: player.name,
		spectator: !!config.spectator
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
			if (player.isBot) {
				console.log('--> ' + player.name + ':');
				console.log(config.type);
				console.log(config.data);
				console.log('--<');
			} else {
				player.socket.emit(config.type, config.data);
			}
		}
	}
};

Session.prototype.getPlayerIndexBySocket = function(socket) {
	var
	foundIndex = -1;
	this.everybody.every(function(player, index) {
		if (player.socket === socket) {
			foundIndex = index;
			return false;
		}
		return true;
	});
	return foundIndex;
};

Session.prototype.removePlayer = function(index) {
	var
	player = this.everybody[index],
	spectator;

	// at first, remove player from all arrays
	this.everybody.splice(index, 1);
	index = this.players.indexOf(player);
	if (!(spectator = index < 0)) {
		this.players.splice(index, 1);
	}
	// then, emit a delete event
	this.emit('delplayer', this, {
		name: player.name,
		spectator: spectator
	});
};

Session.prototype.getPlayerIndexByName = function(name) {
	var
	foundIndex = -1;

	this.everybody.every(function(player, index) {
		if (player.name.toLowerCase() === name.toLowerCase()) {
			foundIndex = index;
			return false;
		}
		return true;
	});
	return foundIndex;
};

Session.prototype.playerDisconnect = function(socket) {
	this.removePlayer(this.getPlayerIndexBySocket(socket));
};

Session.prototype.treatGameEvent = function(socket, data) {
	var playerIndex = this.getPlayerIndexBySocket(socket);
	if (playerIndex < 0) {
		throw new Error("no player found for the socket argument");
	}
	if (data.action === 'start') {
		this.addPlayer({
			name: 'bot1',
			isBot: true
		});
		this.addPlayer({
			name: 'bot2',
			isBot: true
		});
		// console.log(this.everybody);
		// var me = this;
		// setTimeout(function() {
		// 	me.removePlayer(me.getPlayerIndexByName('bot1'));
		// 	me.removePlayer(me.getPlayerIndexByName('bot2'));
		// 	console.log(me.everybody);
		// }, 1000);
		this.start();
	}
};

var prepareInitiativePhase = function(session) {
	var
	maxTailLen = -1,
	largeTailplayers,
	players = session.players.slice(0);

	// determine the initiative order
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
