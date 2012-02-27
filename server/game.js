var
_ = require('underscore'),
util = require('util'),
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

var joinAction = function(socket, data){
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
				message: util.format('you successfully joined the session of index %s', data.index)
            });
        } else{
            socket.emit('KO', {
                message: util.format('session %s is full of spectators', data.index)
            });
        }
    } else{
        if (session.running){
            socket.emit('KO', {
                message: util.format('session %s is running', data.index)
            });
        }
        if (!session.fullOfPlayers()){
            session.addPlayer(socket);
            socket2session[socket.id] = session;
            socket.emit('OK', {
				message: util.format('you successfully joined the session of index %s', data.index)
            });
        } else{
            socket.emit('KO', {
                message: util.format('session %s is full of players', data.index)
            });
        }
    }
};

var leaveAction = function(socket, data){
    socket.emit('KO', {
        message: 'not yet implemented'
    });
};

exports.newPlayer = function(socket){
    // at first, send all sessions to the new player
    socket.emit('sessions', getSessions());

	socket.on('session', function(data){
		var action = data.action ? data.action.toLowerCase() : null;
		if (action === 'join'){
			joinAction(socket, data);
		} else if (action === 'leave'){
			leaveAction(socket, data);
		} else{
            socket.emit('KO', {
                message: 'no valid action specified for the session message'
            });
			console.error('no valid action specified for the session message');
		}
	});

	socket.on('game', function(data){
	});

    // we only expect a join message for now
    socket.on('join', function(data){
    });
};
