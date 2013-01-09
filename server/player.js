var
_ = require('underscore');

var Player = function(config){
    config = config || {};

    //! communication
    this.socket = config.socket;

    //! name of the player
    this.name = config.name;
};

// init before a session
Player.prototype.initSession = function() {
	// init all data structure
    this.genes = null;
};

Player.prototype.addGene = function(gene) {
	if (!this.genes)
		this.genes = {};

	if (!_.isNumber(this.genes[gene]))
		this.genes[gene] = 0;
	this.genes[gene] = 1;
};

Player.prototype.getGeneCount = function(gene) {
	if (this.genes && _.isNumber(this.genes[gene]))
		return this.genes[gene];
	return 0;
};

exports.Player = Player;
