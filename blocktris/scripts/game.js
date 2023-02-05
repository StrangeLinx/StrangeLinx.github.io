export { Game };
import { Matrix } from "./matrix.js";
import { Bag } from "./bag.js";


class Game {

    constructor() {
        this.new()
    }

    new() {
        this.updated = true;
        this.bag = new Bag();
        this.matrix = new Matrix();
        this.inputQueue = [];
        this.previewPiece();
    }

    update(move) {
        if (move.type === "shift") {
            let shiftedPiece = this.bag.newShiftedPiece(move);
            if (this.matrix.valid(shiftedPiece)) {
                this.bag.setCurrentPiece(shiftedPiece);
                this.updated = true;
            }
        } else if (move.type === "rotate") {
            let rotatedPiece = this.bag.newRotatedPiece(move);
            if (this.matrix.valid(rotatedPiece)) {
                this.bag.setCurrentPiece(rotatedPiece);
                this.updated = true;
            }
        } else if (move.type === "drop") {
            let droppedPiece = this.bag.currentPiece;  // valid
            let potDroppedPiece = this.bag.newShiftedPiece({ x: 0, y: 1 });
            while (this.matrix.valid(potDroppedPiece)) {
                droppedPiece = potDroppedPiece;
                this.bag.setCurrentPiece(droppedPiece);
                potDroppedPiece = this.bag.newShiftedPiece({ x: 0, y: 1 });
            }
            this.matrix.place(droppedPiece);
            this.bag.place();
            this.updated = true;
            this.matrix.clearLines();
        } else if (move.type === "hold") {
            this.bag.hold();
            this.updated = true;
        }
        this.previewPiece();
        this.matrix.previewCurrent(this.bag.currentPiece);
    }

    previewPiece() {
        let ghostPiece;
        let nextGhostPiece = this.bag.newGhostPiece();
        while (this.matrix.valid(nextGhostPiece)) {
            ghostPiece = nextGhostPiece;
            nextGhostPiece = this.bag.nextGhostPiece();
        }
        this.matrix.preview(this.bag.currentPiece, ghostPiece);
    }

    setUpdated(bool) {
        this.updated = bool;
    }

    getRows() {
        return this.matrix.rows;
    }

    getCols() {
        return this.matrix.cols;
    }

    getMinos() {
        return this.matrix.getMinos();
    }

    getHoldMinos() {
        let holdPiecePreview = this.bag.holdPreview();
        if (holdPiecePreview) {
            return this.matrix.getHoldMinos(holdPiecePreview);
        }
        return [];
    }

    getNextMinos() {
        let nextPieces = this.bag.nextPreview();
        return this.matrix.getNextMinos(nextPieces);
    }

    over() {
        return this.matrix.gameOver;
    }

}
