var
Player = require('./player.js').Player,
_ = require('underscore'),
util = require('util'),
BoardCore = require('../common/board-core.js'),
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
	this.initiative = [];
	this.infoBoard = undefined;
	this.geneBag = undefined;
	this.eventCards = undefined;
	this.pawns = undefined; // dinosaurs
	this.leftRounds = undefined;
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
		if (event === 'KO') {
			console.error('error: ' + message);
		} else {
			console.log(message);
		}
	}
};

Session.prototype.addPlayer = function(config) {
	var
	player,
	playerData;

	config = config || {};
	if (!config.isBot && !config.socket) {
		throw new Error('Session.addPlayer(): no socket provided');
	}

	// can the player join?
	if (config.spectator) {
		if (this.fullOfSpectators()) {
			sendMessage(config.socket, 'KO', 'session has reached its maximum amount of spectators');
			return null;
		}
	} else {
		if (this.running) {
			sendMessage(config.socket, 'KO', 'game has been started');
			return null;
		}
		if (this.fullOfPlayers()) {
			sendMessage(config.socket, 'KO', 'session has reached its maximum amount of players');
			return null;
		}
	}

	// player is accepted!
	player = new Player({
		socket: config.socket,
		isBot: config.isBot,
		name: config.name || this.createUniquePlayerName()
	});
	this.everybody.push(player);
	if (!config.spectator) {
		this.players.push(player);
	}
	sendMessage(config.socket, 'OK', util.format('you successfully joined the session. Your name is "%s"', player.name));
	playerData = {
		event: 'newplayer',
		name: player.name,
		spectator: !!config.spectator
	};
	if (!config.spectator) {
		playerData.playerIndex = this.players.length - 1;
	}
	this.broadcast({
		blacklist: player,
		type: 'session',
		data: playerData
	});

	this.emit('newplayer', this, {
		name: player.name,
		spectator: !!config.spectator
	});

	return player;
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
			botVerbose = false; // TODO: define a better place for options
			if (!player.isBot) {
				player.socket.emit(config.type, config.data);
			} else if (botVerbose) {
				console.log('--> ' + player.name + ':');
				console.log(config.type);
				console.log(config.data);
				console.log('--<');
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
	if ((spectator = (index < 0)) == false) {
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
	var
	playerIndex = this.getPlayerIndexBySocket(socket),
	i, j, c,
	player;
	if (playerIndex < 0) {
		throw new Error("no player found for the socket argument");
	}
	if (data.action === 'start') {
		// TODO: remove the following until the dashes (just for tests)
		for (i = 0; i < 4; i++) {
			player = this.addPlayer({
				name: 'bot' + (i + 1),
				isBot: true
			});
			if (i >= 0 && i <= 2) {
				c = 4;
			} else {
				c = 2;
			}
			for (j = 0; j < c; j++) {
				player.addGene('tail');
			}
		}
		// END OF TOTO ---------
		this.start();
	}
};

var randomizeArray = function(ar) {
	var
	i,
	len,
	swap;

	for (i = 0, len = ar.length - 1; i < len; i++) {
		swapIndex = _.random(i, len);
		if (swapIndex === i) {
			continue;
		}
		swap = ar[i];
		ar[i] = ar[swapIndex];
		ar[swapIndex] = swap;
	}
};

var padNumber = function(num, pad) {
	var
	str = String(num),
	len = str.length;

	while (len < pad) {
		str = '0' + str;
		len++;
	}

	return str;
};

var prepareInitiativePhase = function(session) {
	var
	groups = {},
	groupNames = [],
	groupName,
	group;

	// 1. group players
	session.players.forEach(function(player, index) {
		groupName = util.format("%d%s", 6 - player.getGeneCount('tail'), padNumber(player.getDinosaurCount(), 2));
		group = groups[groupName] || [];

		group.push(index);
		groups[groupName] = group;
	});

	// 2. shake all groups (= randomize players indexes)
	for (groupName in groups) {
		if (groups.hasOwnProperty(groupName)) {
			randomizeArray(groups[groupName]);
			groupNames.push(groupName);
		}
	}

	// 3. re-gather all to build the initiative queue
	session.initiative = [];
	groupNames.sort().forEach(function(groupName) {
		groups[groupName].forEach(function(playerIndex) {
			session.initiative.push(playerIndex);
		});
	});

	// 4. finally, broadcast the result to all players
	session.broadcast({
		type: 'game',
		data: {
			event: 'initiative',
			data: session.initiative
		}
	});

	// no need to wait player events to launch the next phase
	nextPhase(session);
};

/*
 * Here follow weather codes:
 * 0 = yellow
 * 1 = bottom green
 * 2 = bottom brown
 * 3 = gray
 * 4 = top brown
 * 5 = top green
 */

var getWeatherColor = function(weatherCode) {
	switch (weatherCode) {
	case 0:
		return 'yellow';
	case 1:
	case 5:
		return 'green';
	case 2:
	case 4:
		return 'brown';
	case 3:
		return 'gray';
	default:
		return '';
	}
};

/*!
 * \brief return the next weather state index
 */
var getNextWeather = function(weather, dice) {
	switch (dice) {
	case 1:
		return (weather + 1) % 6;
	case 2:
		return weather;
	default:
		return weather ? weather - 1 : 5;
	}
};

var prepareWeatherPhase = function(session) {
	var
	dice = _.random(1, 6);

	// move the weather pawn
	session.currentWeather = getNextWeather(session.currentWeather, dice);

	// broadcast results
	session.broadcast({
		type: 'game',
		data: {
			event: 'weather',
			dice: dice,
			weather: session.currentWeather,
			color: getWeatherColor(session.currentWeather)
		}
	});

	// no need to wait player events to launch the next phase
	nextPhase(session);
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
	// broadcast the phase beginning
	session.broadcast({
		type: 'game',
		data: {
			event: 'newphase',
			phase: session.phase
		}
	});

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

// launch the next phase
var nextPhase = function(session) {
	session.phase = session.phase % 6 + 1;
	preparePhase(session);
};

var initTurn = function(session) {
	// prepare all players
	session.players.forEach(function(player) {
//		player.initSession();
		player.dinosaurs = 3; // TODO: remove it (just for tests)
	});
	// launch the first phase
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

	this.currentWeather = 0; // yellow (see color definitions)

	// remaining rounds
	this.leftRounds = 16 - this.players.count;

	// prepare all players
	this.players.forEach(function(player) { player.initSession(); });

	console.log(BoardCore.createBoard('A', 'C'));

	this.turn = 1;
	initTurn(this);
};

exports.Session = Session;
