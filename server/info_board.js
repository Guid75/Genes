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


InfoBoard.prototype.moveNextWeather = function(dice) {
	this.currentWeather = getNextWeather(this.currentWeather, dice);
};

exports.InfoBoard = InfoBoard;
