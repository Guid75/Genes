// contains all structures relatives to the main game board
(function(exports) {
    // contains all initial data about main game board
    // parts are always oriented from sea (left) to earth (right)
    // Nothing = 0
    // Brown  = 1 (hill)
    // Yellow = 2 (beach)
    // Gray   = 3 (Mountain)
    // Green  = 4 (meadow)
    var parts = {
        A: {
			tiles: [
				[0, 0, 4, 2, 3],
				[0, 2, 1, 3],
				[0, 2, 4, 1, 2],
				[3, 4, 1, 3],
				[2, 1, 3, 4, 1],
				[4, 1, 3, 3],
				[0, 2, 4, 1, 2],
				[0, 2, 2, 1],
				[0, 0, 4, 3, 3]
			],
			starts: [[1, 1], [1, 7]]
		},
        B: {
			tiles: [
				[0, 0, 3],
				[0, 1],
				[0, 4, 2],
				[2, 3],
				[2, 4, 1],
				[1, 1],
				[0, 4, 2],
				[0, 3],
				[0, 0, 3]
			],
			starts: [[0, 4]]
        },
        C: {
			tiles: [
				[3, 3, 2, 1, 0, 0],
				[4, 1, 2, 4, 0, 0],
				[2, 2, 4, 3, 4, 0],
				[3, 1, 3, 3, 2, 0],
				[1, 3, 1, 1, 4, 2],
				[3, 4, 3, 2, 4, 0],
				[2, 1, 1, 3, 1, 0],
				[4, 4, 4, 2, 0, 0],
				[3, 2, 2, 1, 0, 0]
			],
			starts: [[2, 0], [5, 4], [2, 8]]
		},
        D: {
			tiles: [
				[3, 3, 4, 0, 0],
				[1, 2, 2, 0, 0],
				[2, 1, 4, 2, 0],
				[3, 3, 1, 4, 0],
				[1, 4, 3, 1, 2],
				[3, 1, 4, 3, 0],
				[2, 1, 4, 2, 0],
				[3, 1, 2, 0, 0],
				[3, 2, 4, 0, 0]
			],
			starts: [[2, 1], [2, 7]]
		}
    };

    var boardsInfos = {
        'A-C': {
            players: 5
        },
        'A-D': {
            players: 4
        },
        'B-C': {
            players: 4
        },
        'B-D': {
            players: 3
        }
    };

	var combineTwoStartsArrays = function(ar1, ar2, compLen) {
		var
		ares = [],
		i, len,
		cpyAr;

		for (i = 0, len = ar1.length; i < len; i++) {
			ares.push(ar1[i].slice(0));
		}

		for (i = 0, len = ar2.length; i < len; i++) {
			cpyAr = ar2[i].slice(0);
			cpyAr[0] += compLen;
			ares.push(cpyAr);
		}
		return ares;
	};

    /**
     * Generates a 2-dimensional array in function of two parts
     * @param {string} part1 A board ID. Can be "A", "B", "C" or "D"
     * @param {string} part2 A board ID. Can be "A", "B", "C" or "D"
     * The following combinations are authorized:
     * B-D (3 players)
     * A-D (4 players)
     * B-C (4 players)
     * A-C (5 players)
     * @return {array} The board array generated
     */
    var createBoard = function(part1, part2) {
        var
        ar1 = parts[part1].tiles,
        ar2 = parts[part2].tiles,
        i,
        len = ar1.length,
        board = { tiles: [], starts: [] },
        row,
		startAr;

        if (!boardsInfos[part1 + '-' + part2]) {
            throw new Error('createBoard(): invalid parts combination! (must be "A-C", "A-D", "B-C" or "B-D")');
        }

        for (i = 0; i < len; i++) {
            row = ar1[i].concat(ar2[i]);
            if (!(i % 2)) {
                row.splice(ar1[i].length - 1, 1);
            }
            board.tiles.push(row);
        }

		board.starts = combineTwoStartsArrays(parts[part1].starts, parts[part2].starts, ar1[1].length);

		// TODO add start points of the two parts
        return board;
    };
    exports.createBoard = createBoard;
    exports.boardsInfos = boardsInfos;
}(typeof exports === 'undefined'? Game.board = {} : exports));
