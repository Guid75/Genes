var
Player = require('./player.js').Player,
_ = require('underscore'),
util = require('util'),
events = require('events');

var maxPlayers = 5;
var maxSpectators = 100;

var Session = function(config){
    config = config || {};

    this.running = false;
    this.players = [];
	this.everybody = [];
};

util.inherits(Session, events.EventEmitter);

Session.prototype.playersCount = function(){ return this.players.length; };
Session.prototype.isRunning = function(){ return this.running; };
Session.prototype.fullOfPlayers = function(){ return this.players.length === maxPlayers; };
Session.prototype.fullOfSpectators = function(){ return this.spectators.length === maxSpectators; };
Session.prototype.isRunnable = function(){ return this.players.length >= 3; }; // if we have the right count of players to start a game session

Session.prototype.addPlayer = function(config){
	var player, socket, spectator;
	config = config || {};
	if (!config.socket){
		throw new Error('Session.addPlayer(): no socket provided');
	}
	socket = config.socket;
	if (config.spectator){
		if (this.fullOfSpectators()){
            socket.emit('KO', {
                message: 'session has reached its maximum amount of spectators'
            });
			return false;
		}
		spectator = true;
	} else{
        if (this.running){
            socket.emit('KO', {
                message: 'game has been started'
            });
			return false;
        }
		if (this.fullOfPlayers()){
            socket.emit('KO', {
                message: 'session has reached its maximum amount of players'
            });
			return false;
		}
		this.players.push(player = new Player({
			socket: config.socket
		}));
	}
	this.everybody.push(player);
	socket.emit('OK', { message: 'session has successfully been joined' });
	this.broadcast({
		blacklist: player,
		type: 'session',
		data: {
			event: 'newplayer',
			name: player.name,
			spectator: spectator
		}
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

Session.prototype.removePlayer = function(socket){
	var i, len = this.everybody.length, player, index;
	for (i = 0; i < len; i++){
		player = this.everybody[i];
		if (player.socket === socket){
			this.everybody.splice(i, 1);
			index = this.players.indexOf(player);
			if (index >= 0){
				this.players.splice(index, 1);
			}
			return;
		}
	}
};

exports.Session = Session;
