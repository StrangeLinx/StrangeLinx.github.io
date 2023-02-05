export { pieces };

// Structure of pieces
// pieces.num are the number of unique pieces
// piece.types are the unique types of pieces
// pieces[pieceType][Rotation][Mino]
//     Rotation is the number of 90 degree rotations
//     Each piece has 4 minos and Mino gives x and y that it spans given to it's origin (0, 0)
//
// Example. pieces["o"][0][2] describes the 3rd (index 2) mino's (x, y) position of an "o"
//          block relative to it's origin. As shown, O is origin and X is mino's position:
//          ----Xo----
//          ----Oo----
//
// Note: Origin of matrix is top left. Positive x axis is right and positive y axis is down.
//       This means that to go up 1 unit you subtract 1 from y

const pieces = {
    ghost: "ghost",
    num: 7,
    types: ["o", "i", "l", "j", "s", "t", "z"],
    spanLength: 4,
    o: {
        0: { 0: origin(), 1: right(), 2: up(), 3: upRight() },
        1: { 0: origin(), 1: right(), 2: up(), 3: upRight() },
        2: { 0: origin(), 1: right(), 2: up(), 3: upRight() },
        3: { 0: origin(), 1: right(), 2: up(), 3: upRight() }
    },
    i: {
        0: { 0: origin(), 1: left(), 2: right(), 3: right2() },
        1: { 0: right(), 1: upRight(), 2: downRight(), 3: down2Right()},
        2: { 0: down(), 1: downLeft(), 2: downRight(), 3: downRight2()},
        3: { 0: origin(), 1: up(), 2: down(), 3: down2()}
    },
    l: {
        0: { 0: origin(), 1: left(), 2: right(), 3: upRight() },
        1: { 0: origin(), 1: up(), 2: down(), 3: downRight()},
        2: { 0: origin(), 1: downLeft(), 2: left(), 3: right()},
        3: { 0: origin(), 1: upLeft(), 2: up(), 3: down()}
    },
    j: {
        0: { 0: origin(), 1: left(), 2: upLeft(), 3: right() },
        1: { 0: origin(), 1: upRight(), 2: up(), 3: down()},
        2: { 0: origin(), 1: left(), 2: right(), 3: downRight()},
        3: { 0: origin(), 1: downLeft(), 2: down(), 3: up()}
    },
    s: {
        0: { 0: origin(), 1: left(), 2: up(), 3: upRight() },
        1: { 0: origin(), 1: up(), 2: right(), 3: downRight()},
        2: { 0: origin(), 1: downLeft(), 2: down(), 3: right()},
        3: { 0: origin(), 1: upLeft(), 2: left(), 3: down()}
    },
    t: {
        0: { 0: origin(), 1: left(), 2: up(), 3: right() },
        1: { 0: origin(), 1: up(), 2: right(), 3: down()},
        2: { 0: origin(), 1: right(), 2: down(), 3: left()},
        3: { 0: origin(), 1: down(), 2: left(), 3: up()}
    },
    z: {
        0: { 0: origin(), 1: upLeft(), 2: up(), 3: right() },
        1: { 0: origin(), 1: down(), 2: right(), 3: upRight()},
        2: { 0: origin(), 1: left(), 2: down(), 3: downRight()},
        3: { 0: origin(), 1: downLeft(), 2: left(), 3: up()}
    }
};


function origin() {
    return { x: 0, y: 0 };
}

function left() {
    return { x: -1, y: 0 };
}

function right() {
    return { x: 1, y: 0 };
}

function right2() {
    return { x: 2, y: 0};
}

function up() {
    return { x: 0, y: -1 };
}

function down() {
    return { x: 0, y: 1 };
}

function down2() {
    return { x: 0, y: 2};
}

function upLeft() {
    return { x: -1, y: -1 };
}

function upRight() {
    return { x: 1, y: -1 };
}

function downRight() {
    return { x: 1, y: 1};
}

function down2Right() {
    return { x: 1, y: 2};
}

function downRight2() {
    return { x: 2, y: 1};
}

function downLeft() {
    return { x: -1, y: 1};
}