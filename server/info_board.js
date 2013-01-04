var
Player = require('./player.js').Player,
_ = require('underscore'),
util = require('util'),
events = require('events');

/*
 * Here follow weather codes:
 * 0 = yellow
 * 1 = bottom green
 * 2 = bottom brown
 * 3 = gray
 * 4 = top brown
 * 5 = top green
 */

var InfoBoard = function() {
	this.initiative = []; // order of players for the current round, an array of player indexes
	this.currentWeather = 0; // yellow (see color definitions)
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

// Session.prototype.playersCount = function() { return this.players.length; };
// Session.prototype.spectatorsCount = function() { return this.everybody.length - this.players.length; };
// Session.prototype.isRunning = function() { return this.running; };
// Session.prototype.fullOfPlayers = function() { return this.players.length === maxPlayers; };
// Session.prototype.fullOfSpectators = function() { return this.spectatorsCount() === maxSpectators; };
// Session.prototype.isRunnable = function() { return this.players.length >= 3; }; // if we have the right count of players to start a game session

exports.InfoBoard = InfoBoard;
