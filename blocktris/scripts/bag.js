import { pieces } from "./pieces.js";


export class Bag {

    constructor() {
        this.randomPieces = pieces.types;
        this.numPieces = 7;  // current is index 0. 6 Next previews
        this.new();
    }

    new() {
        this.queue = [];
        this.holdPiece = "";
        this.ghostPiece = "";
        this.addPieces();
        this.newCurrentPiece();
        this.held = false;
    }

    hold() {
        if (this.held) {
            return;
        }
        if (this.holdPiece !== "") {
            let temp = this.holdPiece;
            this.holdPiece = this.currentPiece;
            this.currentPiece = temp;
        } else {
            this.holdPiece = this.currentPiece;
            this.nextPiece();
        }
        this.holdPiece.x = 4;
        this.holdPiece.y = 0;
        this.holdPiece.rot = 0;
        let spans = pieces[this.holdPiece.type][this.holdPiece.rot];
        spans.length = pieces.spanLength
        this.holdPiece.span = spans;
        this.held = true;
    }

    holdPreview() {
        if (this.holdPiece === "") {
            return;
        }
        let spans = pieces[this.holdPiece.type][0];
        spans.length = pieces.spanLength
        return {
            type: this.holdPiece.type,
            rot: 0,
            span: spans,
            x: 1,
            y: 4
        }
    }

    nextPreview() {
        let nextPreviews = [];
        let spans, type;
        for (let i = 1; i < this.numPieces; i++) {
            type = this.queue[i];
            spans = pieces[type][0];
            spans.length = pieces.spanLength;
            nextPreviews.push({
                type: type,
                rot: 0,
                span: spans,
                x: 2,
                y: i*3 - 1
            });
        }
        return nextPreviews;
    }

    addPieces() {
        this.shuffle();
        this.queue = this.queue.concat(this.randomPieces);
    }

    shuffle() {
        // Fisher-Yates Shuffle
        let currentIndex = this.randomPieces.length;
        let randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.randomPieces[currentIndex], this.randomPieces[randomIndex]] = [
                this.randomPieces[randomIndex], this.randomPieces[currentIndex]];
        }
    }

    place() {
        this.nextPiece();
        this.held = false;
    }

    nextPiece() {
        this.queue.shift();
        this.newCurrentPiece();
        if (this.queue.length < this.numPieces) {
            this.addPieces();
        }
    }

    newShiftedPiece(move) {
        return {
            type: this.currentPiece.type,
            rot: this.currentPiece.rot,
            span: this.currentPiece.span,
            x: this.currentPiece.x + move.x,
            y: this.currentPiece.y + move.y
        };
    }

    newGhostPiece() {
        this.ghostPiece = this.newShiftedPiece({ x: 0, y: 1 });
        this.ghostPiece.type = pieces.ghost;
        return this.ghostPiece;
    }

    nextGhostPiece() {
        this.ghostPiece = this.shift(this.ghostPiece, { x: 0, y: 1 });
        return this.ghostPiece;
    }

    shift(piece, move) {
        return {
            type: piece.type,
            rot: piece.rot,
            span: piece.span,
            x: piece.x + move.x,
            y: piece.y + move.y
        };
    }

    newRotatedPiece(move) {
        let rotation = (this.currentPiece.rot + move.rot + 4) % 4;
        let spans = pieces[this.currentPiece.type][rotation];
        spans.length = pieces.spanLength
        return {
            type: this.currentPiece.type,
            rot: rotation,
            span: spans,
            x: this.currentPiece.x,
            y: this.currentPiece.y
        };
    }

    newDroppedPiece(newY) {
        return {
            type: this.currentPiece.type,
            rot: this.currentPiece.rot,
            span: this.currentPiece.span,
            x: this.currentPiece.x,
            y: newY
        };
    }

    setCurrentPiece(piece) {
        this.currentPiece = piece;
    }

    newCurrentPiece() {
        let currentPieceType = this.queue[0]
        let rotation = 0;
        let spans = pieces[currentPieceType][rotation];
        spans.length = pieces.spanLength
        this.currentPiece = {
            type: currentPieceType,
            rot: rotation,
            span: spans,
            x: 4,
            y: 0
        };
    }

}