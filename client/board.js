(function() {
    /**
     * Draw a regular hexagons grid in a context
     * @param {2DContext} context The canvas context in which we will draw the hexagrid
     * @param {Number} side The side length of an hexagon
     * @param {Number} width The width of the grid in hexagon unities
     * @param {Number} height The Height of the grid in hexagon unities
     */
    var drawHexaGrid = function(side) {
        var
		c = side,
        a = c / 2,
        b = (Math.sqrt(3) * c) / 2,
        i, j,
        xOf, yOf,
		context = Game.board.context,
		width = Game.board.board.tiles[0].length,
		height = Game.board.board.tiles.length;

//        context.lineWidth = 2;
        for (i = 0; i < width; i++) {
            for (j = 0; j < height; j++) {
				switch (Game.board.board.tiles[j][i]) {
				case 0:
					continue;
				case 1:
					context.fillStyle = '#A00';
					break;
				case 2:
					context.fillStyle = '#FF8';
					break;
				case 3:
					context.fillStyle = '#AAC';
					break;
				case 4:
					context.fillStyle = '#0A0';
					break;
				}
                if (j % 2) {
                    xOf = 2 * b * i + b;
                    yOf = ((j - 1) / 2) * 3 * c + a + c;
//                    context.translate(2 * b * i + b, ((j - 1) / 2) * 3 * c + a + c);
                } else {
                    xOf = 2 * b * i;
                    yOf = (j / 2) * 3 * c;
//                    context.translate(2 * b * i, (j / 2) * 3 * c);
                }

                context.beginPath();
                context.moveTo(b + xOf, yOf);
                context.lineTo(xOf, a + yOf);
                context.lineTo(xOf, a + c + yOf);
                context.lineTo(b + xOf, 2 * c + yOf);
                context.lineTo(2 * b + xOf, a + c + yOf);
                context.lineTo(2 * b + xOf, a + yOf);
                context.closePath();
                context.fill();
                context.stroke();
//                context.setTransform(1,0,0,1,0,0);
            }
        }
    };

	var drawAll = function(side) {
		var
		context = Game.board.context,
		canvas = Game.board.canvas;

		// Store the current transformation matrix
		context.save();

		// Use the identity matrix while clearing the canvas
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Restore the transform
		context.restore();

		drawHexaGrid(20);
	};

	Game.board.drawAll = drawAll;
}());
