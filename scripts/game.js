import Grid from "./grid.js";
import PiecesQueue from "./pieces-queue.js";


export default class Game {

    constructor() {
        this.new()
    }

    new() {
        this.piecesQueue = new PiecesQueue();
        this.grid = new Grid();
        this.previewCurrentPiece();
        this.updatedGrid = true;
        this.updatedHold = true;
        this.updatedNext = true;
        this.paused = true;
        // If a piece is rotated next to a wall, allow a "kick"
        // Meaning that the piece rotates and it gets shifted a block or two
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
        // i piece has to be special...
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

    // Current piece in grid and where it would land if dropped
    previewCurrentPiece() {
        let dropPreviewPiece = this.calculateDropPreviewPiece();
        this.grid.setPreviewPieces(this.piecesQueue.currentPiece(), dropPreviewPiece);
    }

    // Determines where current piece would land if dropped
    calculateDropPreviewPiece() {
        let currentPiece = this.piecesQueue.currentPiece();
        let dropPreviewPiece = this.calculateDroppedPiece(currentPiece)

        // If the drop preview piece is underneath the current piece there's no drop preview
        if (this.piecesQueue.sameCoords(currentPiece, dropPreviewPiece)) {
            return;
        }
        this.piecesQueue.makeDropPreviewType(dropPreviewPiece);
        return dropPreviewPiece;
    }

    // Determines where given piece would land if dropped
    // Logic is shifting piece down until the move is invalid
    calculateDroppedPiece(piece) {
        let newPiece = piece;
        let potentialPiece = this.piecesQueue.shiftPiece(piece, 0, 1); // move 1 down
        while (this.grid.valid(potentialPiece)) {
            newPiece = potentialPiece;
            potentialPiece = this.piecesQueue.shiftPiece(newPiece, 0, 1);
        }
        return newPiece;
    }

    // Receive move from the main driver and update game
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

        // If there was an upgrade to the grid then recalculate current piece and where it would land if dropped
        if (this.updatedGrid) {
            this.previewCurrentPiece();
        }
    }

    shiftPiece(x, y) {
        let shiftedPiece = this.piecesQueue.shiftCurrentPiece(x, y);
        this.moveIfValid(shiftedPiece);
    }

    rotatePiece(rot) {
        let currentPieceType = this.piecesQueue.currentPieceType();

        // If rotating an o piece, there's no change
        if (currentPieceType === "o") {
            return;
        }
        
        // Try to rotate piece
        let rotatedPiece = this.piecesQueue.rotateCurrentPiece(rot);
        if (this.moveIfValid(rotatedPiece)) {
            return;
        }

        // Try wall kicks
        let currentRot = this.piecesQueue.currentPieceRot();
        let newRot = rotatedPiece.rot;
        if (currentPieceType === "i") { // i piece
            this.rotateWithWallKick(rotatedPiece, this.rotKickI[currentRot][newRot]);
        } else { // l, j, s, t, or z piece
            this.rotateWithWallKick(rotatedPiece, this.rotKick[currentRot][newRot]);
        }
    }

    rotateWithWallKick(rotatedPiece, wallKick) {
        let potPiece;
        for (let i = 0; i < wallKick.length; i++) {
            potPiece = this.piecesQueue.shiftPiece(rotatedPiece, wallKick[i][0], wallKick[i][1]);
            if (this.moveIfValid(potPiece)) {
                return;
            }
        }
    }

    // When user wants to drop the piece do the following
    //   calculate where the piece would drop
    //   place the piece in calcualted drop location
    //   remove piece from queue to get next piece
    //   check if lines should be cleared
    dropPiece() {
        let droppedPiece = this.calculateDroppedPiece(this.piecesQueue.currentPiece());
        this.grid.place(droppedPiece);
        this.piecesQueue.place();
        this.grid.clearLines();
        this.updatedGrid = true;
        this.updatedNext = true;
    }

    holdPiece() {
        const [held, heldNext] = this.piecesQueue.hold();
        this.updatedHold = held;      // If piece is held, then hold preview changed
        this.updatedGrid = held;      // If piece is held, new piece is in the grid
        this.updatedNext = heldNext;  // If the next peice is held, then next preview changed
    }

    // Determines if piece in the grid would be a valid move
    // If it is then update the current peice to reflect that
    moveIfValid(piece) {
        if (this.grid.valid(piece)) {
            this.piecesQueue.setCurrentPiece(piece);
            this.updatedGrid = true;
            return true;
        }
        return false;
    }

    getRows() {
        return this.grid.rows;
    }

    getCols() {
        return this.grid.cols;
    }

    //  
    //  The following three tags retrieves the squares (a component of the piece)
    //  So that the driver can draw them for the user
    //  

    getGridSquares() {
        return this.grid.getGridSquares();
    }

    getHoldSquares() {
        let holdPiecePreview = this.piecesQueue.holdPreview();
        if (holdPiecePreview) {
            return this.grid.generateHoldSquares(holdPiecePreview);
        }
        return [];
    }

    getNextSquares() {
        let nextPieces = this.piecesQueue.nextPreviews();
        return this.grid.generateNextSquares(nextPieces);
    }

    setUpdatedGrid(bool) {
        this.updatedGrid = bool;
    }

    setUpdatedHold(bool) {
        this.updatedHold = bool;
    }

    setUpdatedNext(bool) {
        this.updatedNext = bool;
    }

    over() {
        return this.grid.gameOver;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

}
