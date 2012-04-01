var
_ = require('underscore'),
util = require('util'),
Session = require('./session.js').Session,
Player = require('./player.js').Player;

// game namespace
var maxSessionCount = 10;

var broadcastServerState = function(session) {
    // broadcast the new server state to everybody
    _.each(sockets, function(socket) {
        socket.emit('session', {
            event: 'refresh',
            index: allSessions.indexOf(session),
            server: {
                players: session.playersCount(),
                spectators: session.spectatorsCount(),
                running: session.isRunning()
            }
        });
    });
};

// create all empty sessions
var allSessions = [];
var i, session;
for (i = 0; i < maxSessionCount; i++) {
    session = new Session();
    session.on('newplayer', function(session, player) {
        broadcastServerState(session);
    });
    session.on('delplayer', function(session, player) {
        broadcastServerState(session);
    });
    allSessions.push(session);
}

var generateSessionsSnapshot = function() {
    var sessions = [];
    var i = 0;
    _.each(allSessions, function(session) {
        sessions.push({
            players: session.playersCount(),
            spectators: session.spectatorsCount(),
            running: session.isRunning()
        });
    });
    return sessions;
};

var sockets = [];
var socket2session = {};

var joinAction = function(socket, data) {
    var
	session,
	sessionIndex;

    if (!_.isNumber(data.index)) {
        socket.emit('KO', {
            message: 'no session index in the join message'
        });
        console.error('no session index in the join message');
        return false;
    }
	sessionIndex = data.index;

    if (sessionIndex < 0 || sessionIndex >= maxSessionCount) {
        socket.emit('KO', {
            message: 'session index out of bounds'
        });
        console.error('session index out of bounds');
        return false;
    }

    session = socket2session[socket.id];
    if (session && allSessions[sessionIndex] === session) { // already in the wanted session?
		socket.emit('KO', {
			message: util.format("you are already in the session of index %s", sessionIndex)
		});
		return false;
    }

	if (session) { // remove of the old session
		session.removePlayer(socket);
		socket2session[socket.id] = null; // TODO: remove definitively the field
	}

    session = allSessions[sessionIndex];
	if (session.addPlayer({ // maybe callback later?
		socket: socket,
		spectator: data.spectator
	})) {
		socket2session[socket.id] = session;
		return true;
	}
	return false;
};

var leaveAction = function(socket, data) {
    session = socket2session[socket.id];
	if (session) {
		session.removePlayer(socket);
		socket2session[socket.id] = null; // TODO: remove definitively the field
	}
};

exports.newPlayer = function(socket) {
    sockets.push(socket);

    socket.on('disconnect', function() {
        // remove it from its session
        session = socket2session[socket.id];
	    if (session) {
		    session.removePlayer(socket);
		    socket2session[socket.id] = null; // TODO: remove definitively the field
	    }

        var index = sockets.indexOf(socket);
        if (index >= 0) {
            sockets.splice(index, 1);
        }
    });

    // at first, send all sessions to the new player
    socket.emit('session', {
        event: 'list',
        sessions: generateSessionsSnapshot()
    });

	socket.on('session', function(data) {
		var action = data.action ? data.action.toLowerCase() : null;
		var session;
		if (action === 'join') {
			if (joinAction(socket, data)) {
			}
		} else if (action === 'leave') {
			leaveAction(socket, data);
		} else{
            socket.emit('KO', {
                message: 'no valid action specified for the session message'
            });
			console.error('no valid action specified for the session message');
		}
	});

	socket.on('game', function(data) {
		var session = socket2session[socket.id];
		if (session) {
			session.treatGameEvent(socket, data);
		}
	});
};
