var Player = function(config){
    config = config || {};

    //! communication
    this.socket = config.socket;

    //! name of the player
    this.name = config.name;
};

exports.Player = Player;
