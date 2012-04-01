Game.manageSessionMessage = function(data) {
    if (data.event === 'list') {
        Game.mainMenu.refreshAll(data.sessions);
    } else if (data.event === 'refresh') {
        Game.mainMenu.refreshServer(data.index, data.server);
    }
};

Game.manageGameMessage = function(data) {
}
