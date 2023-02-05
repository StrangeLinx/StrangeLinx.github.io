export { Matrix };


class Matrix {

    constructor() {
        this.rows = 20;
        this.cols = 10;
        this.minosPreview = [];
        this.new();
    }

    new() {
        // Array of shape (rows, cols)
        let row = new Array(this.cols).fill("");
        this.matrix = Array.from(Array(this.rows), () => [...row]);
        this.minos = [];
        this.gameOver = false;
    }

    getMinos() {
        return this.minos.concat(this.minosPreview);
    }

    getHoldMinos(piece) {
        let xPos, yPos;
        let holdMinos = [];
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            holdMinos.push({
                x: xPos,
                y: yPos,
                type: piece.type
            })
        }
        return holdMinos;
    }

    getNextMinos(pieces) {
        let xPos, yPos;
        let nextMinos = [];
        pieces.forEach(piece => {
            for (let i = 0; i < piece.span.length; i++) {
                xPos = piece.x + piece.span[i].x;
                yPos = piece.y + piece.span[i].y;
                nextMinos.push({
                    x: xPos,
                    y: yPos,
                    type: piece.type
                });
            }
        });
        return nextMinos;
    }

    clearLines() {
        for (let y = 0; y < this.rows; y++) {
            let x = 0;
            let hole = false;
            while ((x < this.cols) && (!hole)) {
                if (this.matrix[y][x] === "") {
                    hole = true;
                }
                x++;
            }
            if (!hole) {
                this.clearLine(y);
                this.clearMinos(y);
            }
        }
    }

    clearLine(y) {
        this.matrix.splice(y, 1);
        this.matrix.unshift(new Array(this.cols).fill(""));
    }

    clearMinos(y) {
        for (let i = this.minos.length - 1; i >= 0; i--) {
            if (this.minos[i].y === y) {
                this.minos.splice(i, 1);
            } else if (this.minos[i].y < y) {
                this.minos[i].y++;
            }
        }
    }

    valid(piece) {
        let xPos, yPos
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            if (xPos >= this.cols || xPos < 0) {
                return false;
            }
            if (yPos >= this.rows) {
                return false;
            }
            // I need to come back to this. For now, if it's above the board 
            // where the piece spawns it's valid
            if (yPos < 0) {
                continue;
            }
            if (this.matrix[yPos][xPos] !== "") {
                return false;
            }
        }
        return true;
    }

    place(piece) {
        let xPos, yPos;
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            this.placeMino(xPos, yPos, piece.type)
        }
    }

    placeMino(xPos, yPos, minoType) {
        if (yPos < 0) {
            this.gameOver = true;
            return;
        }
        this.matrix[yPos][xPos] = minoType;
        this.minos.push({
            x: xPos,
            y: yPos,
            type: minoType
        });
    }

    preview(piece, ghost) {
        this.minosPreview = [];
        this.previewCurrent(piece);
        if (ghost) {
            this.previewCurrent(ghost);
        }
    }

    previewCurrent(piece) {
        let xPos, yPos;
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            if (yPos < 0) {
                continue;
            }
            if (this.matrix[yPos][xPos] !== "") {
                this.gameOver = true;
                continue;
            }
            this.placeMinoPreview(xPos, yPos, piece.type);
        }
    }

    placeMinoPreview(xPos, yPos, minoType) {
        this.minosPreview.push({
            x: xPos,
            y: yPos,
            type: minoType
        });
    }

}
