// Piece holds the property of a piece.
// Each piece has 4 squares which is represented by it's span
// Span is determined by it's x, y position and rotation
// Default piece spawn is the top middle (-left) of the board

export default class Piece {

    constructor(type, rot = 0, span, x = 4, y = 0) {
        this.type = type;
        this.rot = rot;
        this.span = (span !== undefined) ? span : pieces[type][this.rot];
        this.x = x;
        this.y = y
    }

    rotate(rot) {
        // rot represents the number of 90 degree rotations.
        // If adding 1 to 3 then bring back down to 0
        // If subtracting 1 from 0 bring up to 3
        this.rot = (this.rot + rot + 4) % 4;
        this.span = pieces[this.type][this.rot];
    }
    shift(x, y) {
        this.x += x;
        this.y += y;
    }

    static clone(piece) {
        return new Piece(piece.type, piece.rot, piece.span, piece.x, piece.y);
    }

}


// Structure of pieces
// pieces[pieceType][Rotation][Square]
//     Rotation is the number of 90 degree rotations
//     Each piece has 4 squares and that have their own x and y and span
//
// Example. pieces["o"][0][2] describes the 3rd (index 2) square's (x, y) position of an "o"
//          block relative to it's origin. As shown, big O is origin and X is square's position:
//          ----Xo----
//          ----Oo----
//
// Note: Origin of grid is top left. Positive x axis is right and positive y axis is down.
//       This means that to go up 1 unit subtract 1 from y

const pieces = {
    o: {
        0: { length: 4, 0: origin(), 1: right(), 2: up(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: right(), 2: up(), 3: upRight() },
        2: { length: 4, 0: origin(), 1: right(), 2: up(), 3: upRight() },
        3: { length: 4, 0: origin(), 1: right(), 2: up(), 3: upRight() }
    },
    i: {
        0: { length: 4, 0: origin(), 1: left(), 2: right(), 3: right2() },
        1: { length: 4, 0: right(), 1: upRight(), 2: downRight(), 3: down2Right() },
        2: { length: 4, 0: down(), 1: downLeft(), 2: downRight(), 3: downRight2() },
        3: { length: 4, 0: origin(), 1: up(), 2: down(), 3: down2() }
    },
    l: {
        0: { length: 4, 0: origin(), 1: left(), 2: right(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: up(), 2: down(), 3: downRight() },
        2: { length: 4, 0: origin(), 1: downLeft(), 2: left(), 3: right() },
        3: { length: 4, 0: origin(), 1: upLeft(), 2: up(), 3: down() }
    },
    j: {
        0: { length: 4, 0: origin(), 1: left(), 2: upLeft(), 3: right() },
        1: { length: 4, 0: origin(), 1: upRight(), 2: up(), 3: down() },
        2: { length: 4, 0: origin(), 1: left(), 2: right(), 3: downRight() },
        3: { length: 4, 0: origin(), 1: downLeft(), 2: down(), 3: up() }
    },
    s: {
        0: { length: 4, 0: origin(), 1: left(), 2: up(), 3: upRight() },
        1: { length: 4, 0: origin(), 1: up(), 2: right(), 3: downRight() },
        2: { length: 4, 0: origin(), 1: downLeft(), 2: down(), 3: right() },
        3: { length: 4, 0: origin(), 1: upLeft(), 2: left(), 3: down() }
    },
    t: {
        0: { length: 4, 0: origin(), 1: left(), 2: up(), 3: right() },
        1: { length: 4, 0: origin(), 1: up(), 2: right(), 3: down() },
        2: { length: 4, 0: origin(), 1: right(), 2: down(), 3: left() },
        3: { length: 4, 0: origin(), 1: down(), 2: left(), 3: up() }
    },
    z: {
        0: { length: 4, 0: origin(), 1: upLeft(), 2: up(), 3: right() },
        1: { length: 4, 0: origin(), 1: down(), 2: right(), 3: upRight() },
        2: { length: 4, 0: origin(), 1: left(), 2: down(), 3: downRight() },
        3: { length: 4, 0: origin(), 1: downLeft(), 2: left(), 3: up() }
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
    return { x: 2, y: 0 };
}

function up() {
    return { x: 0, y: -1 };
}

function down() {
    return { x: 0, y: 1 };
}

function down2() {
    return { x: 0, y: 2 };
}

function upLeft() {
    return { x: -1, y: -1 };
}

function upRight() {
    return { x: 1, y: -1 };
}

function downRight() {
    return { x: 1, y: 1 };
}

function down2Right() {
    return { x: 1, y: 2 };
}

function downRight2() {
    return { x: 2, y: 1 };
}

function downLeft() {
    return { x: -1, y: 1 };
}
