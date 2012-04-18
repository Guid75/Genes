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
        A: [
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
        B: [
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
        C: [
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
        D: [
            [3, 3, 4, 0, 0],
            [1, 2, 2, 0, 0],
            [2, 1, 4, 2, 0],
            [3, 3, 1, 4, 0],
            [1, 4, 3, 1, 2],
            [3, 1, 4, 3, 0],
            [2, 1, 4, 2, 0],
            [3, 1, 2, 0, 0],
            [3, 2, 4, 0, 0]
        ]
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
        ar1 = parts[part1],
        ar2 = parts[part2],
        i,
        len = ar1.length,
        board = [],
        row;

        if (!boardsInfos[part1 + '-' + part2]) {
            throw new Error('createBoard(): invalid parts combination! (must be "A-C", "A-D", "B-C" or "B-D")');
        }

        for (i = 0; i < len; i++) {
            row = ar1[i].concat(ar2[i]);
            if (!(i % 2)) {
                row.splice(ar1[i].length - 1, 1);
            }
            board.push(row);
        }
        return board;
    };

    exports.createBoard = createBoard;
    exports.boardsInfos = boardsInfos;
}(typeof exports === 'undefined'? Game.board = {} : exports));
