var Player = function(config){
    config = config || {};

    //! communication
    this.socket = config.socket;

    //! name of the player
    this.name = config.name;
};

Player.prototype.init = function() {
	// init all data structure
	this.genes = {
		card: 0,
		tail: 0,
		mutant: 0,
		umbrella: 0,
		egg: 0,
		fur: 0,
		horn: 0,
		leg: 0
	};
};

exports.Player = Player;
