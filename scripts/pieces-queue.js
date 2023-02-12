import Piece from "./pieces.js";

// Pieces will have a certain pattern to them so they're not completely random
// Every 7 pieces the player will be guaranteed to have at least one of each piece
// A way to accomplish this is to shuffle the pieces oiljstz then add those to the queue

// this.queue[0] is the current piece

export default class PiecesQueue {

    constructor() {
        this.pieces = ["o", "i", "l", "j", "s", "t", "z"]; // holds one of each type of piece
        this.dropPreviewType = "dropPreview";
        // current is index 0. 6 next pieces. NTBCW number of unique pieces
        // queue will always have this number of pieces or more
        this.numPieces = 7;
        this.new();
    }

    new() {
        // The pieces in the queue will be in this.queue
        this.queue = [];
        this.holdPiece = "";
        this.dropPreviewPiece = "";
        this.held = false;
        this.addPiecesToQueue(); // Start off with a new batch
    }

    addPiecesToQueue() {
        this.shuffleNextPieces();
        this.pieces.forEach(type => {
            this.queue = this.queue.concat([new Piece(type)]);
        });
    }

    shuffleNextPieces() {
        // Fisher-Yates Shuffle
        let currentIndex = this.pieces.length;
        let randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.pieces[currentIndex], this.pieces[randomIndex]] = [
                this.pieces[randomIndex], this.pieces[currentIndex]];
        }
    }

    hold() {
        // Prevent the player from holding twice
        if (this.held) {
            return [false, false];
        }

        let heldNext = false;

        // Swap the current piece and the hold piece
        if (this.holdPiece !== "") {
            let temp = this.holdPiece;
            this.holdPiece = new Piece(this.currentPiece().type); // new piece to reset x, y, rot, ...
            this.setCurrentPiece(temp);
        } else { // First time holding - hold with piece in queue
            this.holdPiece = new Piece(this.nextPiece().type);
            heldNext = true
        }

        this.held = true;
        return [true, heldNext];  // [held piece, held from next piece]
    }

    // retrieve the current piece in the hold
    holdPreview() {
        if (this.holdPiece === "") {
            return;
        }
        return this.holdPiece;
    }

    // Current piece is queue[0] so queue[1..7] are pieces in hold 
    nextPreviews() {
        return this.queue.slice(1, this.numPieces);
    }

    // When placing a piece, remove the current piece from the queue
    place() {
        this.held = false;
        return this.nextPiece();
    }

    nextPiece() {
        let placed = this.queue.shift();
        // Always ensure there are at least 7 pieces in queue
        if (this.queue.length < this.numPieces) {
            this.addPiecesToQueue();
        }
        return placed;
    }

    shiftCurrentPiece(x, y) {
        return this.shiftPiece(this.currentPiece(), x, y);
    }

    // Create a new piece and shift it by the given x and y
    shiftPiece(piece, x, y) {
        let shiftedPiece = Piece.clone(piece);
        shiftedPiece.shift(x, y);
        return shiftedPiece;
    }

    rotateCurrentPiece(rot) {
        return this.rotatePiece(this.currentPiece(), rot);
    }

    // Create a new piece and rotate it by the given rotation
    rotatePiece(piece, rot) {
        let rotatedPiece = Piece.clone(piece)
        rotatedPiece.rotate(rot);
        return rotatedPiece;
    }

    makeDropPreviewType(piece) {
        piece.type = this.dropPreviewType;
    }

    // The current piece in the queue is always index 0
    currentPiece() {
        return this.queue[0];
    }

    currentPieceRot() {
        return this.queue[0].rot;
    }

    currentPieceType() {
        return this.queue[0].type;
    }

    // After the game makes a move, the game will update the current piece to the new piece
    setCurrentPiece(piece) {
        this.queue[0] = piece;
    }

    sameCoords(piece1, piece2) {
        return ((piece1.x === piece2.x) && (piece1.y === piece2.y));
    }

}