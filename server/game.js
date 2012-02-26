var
_ = require('underscore'),
Session = require('./session.js').Session,
Player = require('./player.js').Player;

// game namespace
var maxSessionCount = 5;

// create all empty sessions
var allSessions = [];
for (var i = 0; i < maxSessionCount; i++){
    allSessions.push(new Session);
}

var getSessions = function(){
    var sessions = [];
    var i = 0;
    _.each(allSessions, function(session){
        sessions.push({
            players: session.players.length,
            running: session.running
        });
    });
    return sessions;
};

var socket2session = {};

exports.newPlayer = function(socket){
    // at first, send all sessions to the new player
    socket.emit('sessions', getSessions());

    // we only expect a join message for now
    socket.on('join', function(data){
        var session;

        if (!_.isNumber(data.index)){
            socket.emit('KO', {
                message: 'no session index in the join message'
            });
            console.error('no session index in the join message');
            return;
        }
        if (data.index < 0 || data.index >= maxSessionCount){
            socket.emit('KO', {
                message: 'session index out of bounds'
            });
            console.error('session index out of bounds');
            return;
        }

        session = socket2session[socket.id];
        if (session){ // already in another session?
            session.remove(socket.id);
        }

        session = allSessions[+data.index];
        if (data.spectator){
            if (!session.fullOfSpectators()){
                session.addSpectator(socket);
                socket2session[socket.id] = session;
                socket.emit('OK', {
                    message: 'you successfully joined the session of index ' + data.index
                });
            } else{
                socket.emit('KO', {
                    message: 'session ' + data.index + ' is full of spectators'
                });
            }
        } else{
            if (session.running){
                socket.emit('KO', {
                    message: 'session ' + data.index + ' is running'
                });
            }
            if (!session.fullOfPlayers()){
                session.addPlayer(socket);
                socket2session[socket.id] = session;
                socket.emit('OK', {
                    message: 'you successfully joined the session of index ' + data.index
                });
            } else{
                socket.emit('KO', {
                    message: 'session is full of players'
                });
            }
        }
    });
};
