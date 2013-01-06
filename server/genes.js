var
Player = require('./player.js').Player,
_ = require('underscore'),
util = require('util'),
events = require('events');

var GeneSet = function() {
	this.card = 0;
	this.tail = 0;
	this.mutant = 0;
	this.umbrella = 0;
	this.egg = 0;
	this.fur = 0;
	this.horn = 0;
	this.leg = 0;
};


exports.GeneSet = GeneSet;
