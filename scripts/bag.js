import Piece from "./pieces.js";


export default class Bag {

    constructor() {
        this.bag = ["o", "i", "l", "j", "s", "t", "z"];
        this.ghostType = "ghost";
        this.numPieces = 7;  // current is index 0. 6 next pieces. NTBCW number of unique pieces
        this.new();
    }

    new() {
        this.queue = [];
        this.holdPiece = "";
        this.ghostPiece = "";
        this.held = false;
        this.addPiecesToQueue();
    }

    addPiecesToQueue() {
        this.shuffleNextBag();
        this.bag.forEach(type => {
            this.queue = this.queue.concat([new Piece(type)]);
        });
    }

    shuffleNextBag() {
        // Fisher-Yates Shuffle
        let currentIndex = this.bag.length;
        let randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.bag[currentIndex], this.bag[randomIndex]] = [
                this.bag[randomIndex], this.bag[currentIndex]];
        }
    }

    hold() {
        if (this.held) {
            return [false, false];
        }

        let heldNext = false;

        if (this.holdPiece !== "") {
            let temp = this.holdPiece;
            this.holdPiece = new Piece(this.currentPiece().type); // new to reset x, y, rot, ...
            this.setCurrentPiece(temp);
        } else { // First time holding - hold with piece in queue
            this.holdPiece = new Piece(this.nextPiece().type);
            heldNext = true
        }

        this.held = true;
        return [true, heldNext];  // [held piece, held from next piece]
    }

    holdPreview() {
        if (this.holdPiece === "") {
            return;
        }
        return this.holdPiece;
    }

    nextPreviews() {
        return this.queue.slice(1, this.numPieces);
    }

    place() {
        this.held = false;
        return this.nextPiece();
    }

    nextPiece() {
        let placed = this.queue.shift();
        if (this.queue.length < this.numPieces) {
            this.addPiecesToQueue();
        }
        return placed;
    }

    shiftCurrentPiece(x, y) {
        return this.shiftPiece(this.currentPiece(), x, y);
    }

    shiftPiece(piece, x, y) {
        let shiftedPiece = Piece.clone(piece);
        shiftedPiece.shift(x, y);
        return shiftedPiece;
    }

    rotateCurrentPiece(rot) {
        return this.rotatePiece(this.currentPiece(), rot);
    }

    rotatePiece(piece, rot) {
        let rotatedPiece = Piece.clone(piece)
        rotatedPiece.rotate(rot);
        return rotatedPiece;
    }

    makeGhost(piece) {
        piece.type = this.ghostType;
    }

    currentPiece() {
        return this.queue[0];
    }

    setCurrentPiece(piece) {
        this.queue[0] = piece;
    }

    sameCoords(piece1, piece2) {
        return ((piece1.x === piece2.x) && (piece1.y === piece2.y));
    }

}