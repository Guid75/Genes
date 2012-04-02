// contains all structures relatives to the main game board

Game.board = {};

// contains all initial data about main game board
// parts are always oriented from sea (left) to earth (right)
// Nothing = 0
// Red = 1
// Yellow = 2
// Blue = 3
// Green = 4
Game.board.parts = {
    partA: [
        [0, 0, 1, 2, 2, 3],
        [0, 0, 2, 4, 4, 4],
        [0, 1, 3, 1, 1, 2],
        [0, 4, 2, 3, 4, 3],
        [2, 4, 1, 1, 3, 1],
        [0, 4, 2, 3, 4, 3],
        [0, 1, 3, 1, 1, 2],
        [0, 0, 2, 4, 4, 4],
        [0, 0, 1, 2, 2, 3]
    ],
    partB: [
        [0, 0, 4, 2, 3],
        [0, 0, 2, 1, 3],
        [0, 2, 4, 1, 2],
        [0, 3, 4, 1, 3],
        [2, 1, 3, 4, 1],
        [0, 4, 1, 3, 3],
        [0, 2, 4, 1, 2],
        [0, 0, 2, 2, 1],
        [0, 0, 4, 3, 3]
    ],
    partC: [
        [0, 0, 4, 2, 3],
        [0, 0, 2, 1, 3],
        [0, 2, 4, 1, 2],
        [0, 3, 4, 1, 3],
        [2, 1, 3, 4, 1],
        [0, 4, 1, 3, 3],
        [0, 2, 4, 1, 2],
        [0, 0, 2, 2, 1],
        [0, 0, 4, 3, 3]
    ],
    partD: [
        [0, 0, 3],
        [0, 0, 1],
        [0, 4, 2],
        [0, 2, 3],
        [2, 4, 1],
        [0, 1, 1],
        [0, 4, 2],
        [0, 0, 3],
        [0, 0, 3]
    ]
};

/**
 * Generates a 2-dimensional array in function of two parts
 * @param {string} part1 The first part, can be A, B, C or D
 * @param {string} part2 The second part, can be A, B, C or D
 * The following combinations are authorized:
 * B-D
 * B-A
 * B-C
 * A-C
 * @return {array} The board array generated
 */
Game.board.createBoard = function(part1, part2) {
    var
    ar1 = Game.board.parts['part' + part1.toUpperCase()],
    ar2 = Game.board.parts['part' + part2.toUpperCase()];

};

Game.board.createBoard('A', 'C');
