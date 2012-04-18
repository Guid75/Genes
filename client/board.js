(function() {
    /**
     * Draw a regular hexagons grid in a context
     * @param {2DContext} context The canvas context in which we will draw the hexagrid
     * @param {Number} side The side length of an hexagon
     * @param {Number} width The width of the grid in hexagon unities
     * @param {Number} height The Height of the grid in hexagon unities
     */
    var drawHexaGrid = function(context, side, width, height) {
        var c = side;
        var a = c / 2;
//        var b = Math.sin((60 * Math.PI) / 180) * c;
        var b = (Math.sqrt(3) * c) / 2;
        var i, j;

        var board = Game.board.createBoard("B", "D");
        var xOf, yOf;

//        context.lineWidth = 2;
        for (i = 0; i < width; i++) {
            for (j = 0; j < height; j++) {
                if (j % 2) {
                    xOf = 2 * b * i + b;
                    yOf = ((j - 1) / 2) * 3 * c + a + c;
//                    context.translate(2 * b * i + b, ((j - 1) / 2) * 3 * c + a + c);
                    if (i % 2) {
                        context.fillStyle = '#00F';
                    } else {
                        context.fillStyle = '#88F';
                    }
                } else {
                    xOf = 2 * b * i;
                    yOf = (j / 2) * 3 * c;
//                    context.translate(2 * b * i, (j / 2) * 3 * c);
                    if (i % 2) {
                        context.fillStyle = '#F00';
                    } else {
                        context.fillStyle = '#F88';
                    }
                }

                if (j === 0) {
                    if (i === 1) {
                        context.fillStyle = '#444';
                        console.log('(1, 0): ' + (xOf + 2 * b));
                    } else if (i === 2) {
                        context.fillStyle = '#666';
                        console.log('(2, 0): ' + xOf);
                    }
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

    Game.board.drawHexaGrid = drawHexaGrid;
}());
