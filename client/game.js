Game.manageSessionMessage = function(data) {
    if (data.event === 'list') {
        Game.mainMenu.refreshAll(data.sessions);
    } else if (data.event === 'refresh') {
        Game.mainMenu.refreshServer(data.index, data.server);
    }
};

Game.manageGameMessage = function(data) {
	if (data.event === 'start') {
		Game.board.board = Game.board.createBoard(data.leftBoardPart, data.rightBoardPart);
		Game.board.drawAll();
	}
}
