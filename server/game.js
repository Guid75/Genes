// game namespace
var maxSessionCount = 4;

exports.maxPlayersBySession = 5;

var Player = function(config){
    config = config || {};

    //! name of the player
    this.name = config.name;
};

exports.Player = Player;

var Session = function(config){
    config = config || {};

    this.started = false;
    this.players = [];
    this.spectators = [];
};

Session.prototype.isFull = function(){
    return this.players.length === maxPlayersBySession;
};

Session.prototype.addPlayer = function(player){
    if (this.started || this.isFull()){
        return;
    }
    this.players.push(player);
};

exports.Session = Session;

// create all empty sessions
var sessions = [];
for (var i = 0; i < maxSessionCount; i++){
    sessions.push(new Session);
}
