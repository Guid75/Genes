var Player = require('./player.js').Player;

var maxPlayers = 5;
var maxSpectators = 100;

var Session = function(config){
    config = config || {};

    this.running = false;
    this.players = [];
    this.spectators = [];
};

Session.prototype.fullOfPlayers = function(){
    return this.players.length === maxPlayers;
};

Session.prototype.addPlayer = function(socket){
    if (this.running || this.fullOfPlayers()){ // full of players or game running?
        return false;
    }
    this.players.push(new Player({
        socket: socket
    }));
    return true;
};

Session.prototype.fullOfSpectators = function(){
    return this.spectators.length === maxSpectators;
};

Session.prototype.addSpectator = function(socket){
    if (fullOfSpectators()){ // full of spectators?
        return false;
    }
    this.spectators.push(new Player({
        socket: socket
    }));
    return true;
};

exports.Session = Session;
