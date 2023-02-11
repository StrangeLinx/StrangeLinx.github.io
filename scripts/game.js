import Matrix from "./matrix.js";
import Bag from "./bag.js";


export default class Game {

    constructor() {
        this.new()
    }

    new() {
        this.bag = new Bag();
        this.matrix = new Matrix();
        this.previewPieces();
        this.updatedMatrix = true;
        this.updatedHold = true;
        this.updatedNext = true;
        this.paused = true;
        this.rotKick = {
            0: {
                1: [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
                3: [[1, 0], [1, -1], [0, 2], [1, 2]]
            },
            1: {
                2: [[1, 0], [1, 1], [0, -2], [1, -2]],
                0: [[1, 0], [1, 1], [0, -2], [1, -2]]
            },
            2: {
                3: [[1, 0], [1, -1], [0, 2], [1, 2]],
                1: [[-1, 0], [-1, -1], [0, 2], [-1, 2]]
            },
            3: {
                0: [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
                2: [[-1, 0], [-1, 1], [0, -2], [-1, -2]]
            }
        };
        this.rotKickI = {
            0: {
                1: [[-2, 0], [1, 0], [-2, 1], [1, -2]],
                3: [[-1, 0], [2, 0], [-1, -2], [2, 1]]
            },
            1: {
                2: [[-1, 0], [2, 0], [-1, -2], [2, 1]],
                0: [[2, 0], [-1, 0], [2, -1], [-1, 2]]
            },
            2: {
                3: [[2, 0], [-1, 0], [2, -1], [-1, 2]],
                1: [[1, 0], [-2, 0], [1, 2], [-2, -1]]
            },
            3: {
                0: [[1, 0], [-2, 0], [1, 2], [-2, -1]],
                2: [[-2, 0], [1, 0], [-2, 1], [1, -2]]
            }
        };
    }

    previewPieces() {
        let ghostPiece = this.calculateGhostPiece();
        this.matrix.setPreviewPieces(this.bag.currentPiece(), ghostPiece);
    }

    calculateGhostPiece() {
        let currentPiece = this.bag.currentPiece();
        let ghostPiece = this.calculateDroppedPiece(currentPiece)

        // If the ghost piece is underneath the current piece there's no ghost
        if (this.bag.sameCoords(currentPiece, ghostPiece)) {
            return;
        }
        this.bag.makeGhost(ghostPiece);
        return ghostPiece;
    }

    calculateDroppedPiece(piece) {
        let newPiece = piece;
        let potentialPiece = this.bag.shiftPiece(piece, 0, 1); // move 1 down
        while (this.matrix.valid(potentialPiece)) {
            newPiece = potentialPiece;
            potentialPiece = this.bag.shiftPiece(newPiece, 0, 1);
        }
        return newPiece;
    }

    update(move) {
        if (move.type === "shift") {
            this.shiftPiece(move.x, move.y);
        } else if (move.type === "rotate") {
            this.rotatePiece(move.rot)
        } else if (move.type === "drop") {
            this.dropPiece();
        } else if (move.type === "hold") {
            this.holdPiece();
        }
        if (this.updatedMatrix) {
            this.previewPieces();
        }
    }

    shiftPiece(x, y) {
        let shiftedPiece = this.bag.shiftCurrentPiece(x, y);
        this.moveIfValid(shiftedPiece);
    }

    rotatePiece(rot) {
        let rotatedPiece = this.bag.rotateCurrentPiece(rot);

        if (rotatedPiece.type === "o") {
            return; // If rotating an o piece, no change
        }

        // Try to rotate piece
        if (this.moveIfValid(rotatedPiece)) {
            return;
        }

        // Try wall kicks
        if (rotatedPiece.type === "i") { // i piece
            this.rotateWithWallKick(rotatedPiece, this.rotKickI);
        } else { // l, j, s, t, or z piece
            this.rotateWithWallKick(rotatedPiece, this.rotKick);
        }
    }

    rotateWithWallKick(rotatedPiece, wallKicks) {
        let iniRot = this.bag.currentPieceRot();
        let newRot = rotatedPiece.rot;
        let wallKick = wallKicks[iniRot][newRot];
        let potPiece;
        for (let i = 0; i < wallKick.length; i++) {
            potPiece = this.bag.shiftPiece(rotatedPiece, wallKick[i][0], wallKick[i][1]);
            if (this.moveIfValid(potPiece)) {
                return;
            }
        }
    }

    dropPiece() {
        let droppedPiece = this.calculateDroppedPiece(this.bag.currentPiece());
        this.matrix.place(droppedPiece);
        this.bag.place();
        this.matrix.clearLines();
        this.updatedMatrix = true;
        this.updatedNext = true;
    }

    holdPiece() {
        const [held, heldNext] = this.bag.hold();
        this.updatedMatrix = held;  // If piece is held, new piece in the matrix
        this.updatedHold = held;
        this.updatedNext = heldNext;
    }

    moveIfValid(piece) {
        if (this.matrix.valid(piece)) {
            this.bag.setCurrentPiece(piece);
            this.updatedMatrix = true;
            return true;
        }
        return false;
    }

    getRows() {
        return this.matrix.rows;
    }

    getCols() {
        return this.matrix.cols;
    }

    getMatrixMinos() {
        return this.matrix.getMatrixMinos();
    }

    getHoldMinos() {
        let holdPiecePreview = this.bag.holdPreview();
        if (holdPiecePreview) {
            return this.matrix.generateHoldMinos(holdPiecePreview);
        }
        return [];
    }

    getNextMinos() {
        let nextPieces = this.bag.nextPreviews();
        return this.matrix.generateNextMinos(nextPieces);
    }

    setUpdatedMatrix(bool) {
        this.updatedMatrix = bool;
    }

    setUpdatedHold(bool) {
        this.updatedHold = bool;
    }

    setUpdatedNext(bool) {
        this.updatedNext = bool;
    }

    over() {
        return this.matrix.gameOver;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

}
