Game.manageSessionMessage = function(data) {
    if (data.event === 'list') {
        Game.mainMenu.refreshAll(data.sessions);
//        Game.mainMenu.refreshServer(0, { players: 4, running: true });
    } else if (data.event === 'refresh') {
        Game.mainMenu.refreshServer(data.index, data.server);
    }
};
