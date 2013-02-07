var
_ = require('underscore');

var Player = function(config){
    config = config || {};

	this.isBot = !!config.isBot;
	if (!this.isBot) {
		this.socket = config.socket;
	}

    //! name of the player
    this.name = config.name;
};

// init before a session
Player.prototype.initSession = function(firstDinoPoint) {
	// init all data structure
    this.genes = null;

	this.dinosaurs = [ firstDinoPoint.slice(0) ];

	console.log(this.dinosaurs);
};

Player.prototype.addGene = function(gene) {
	if (!this.genes)
		this.genes = {};

	if (!_.isNumber(this.genes[gene]))
		this.genes[gene] = 0;
	this.genes[gene]++;
};

Player.prototype.getGeneCount = function(gene) {
	if (!gene)
		throw new Error('Player.getGeneCount(): a gene argument is required');
	return (this.genes && _.isNumber(this.genes[gene])) ? this.genes[gene] : 0;
};

Player.prototype.getDinosaurCount = function() {
	return this.dinosaurs;
};

exports.Player = Player;
