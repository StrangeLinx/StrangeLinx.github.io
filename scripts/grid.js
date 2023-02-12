export default class Grid {

    constructor() {
        this.rows = 20;
        this.cols = 10;
        this.squaresPreview = [];
        this.centerHold = { x: 1, y: 4 };
        this.centerNext = { x: 2, y: -1 };
        this.new();
    }

    new() {
        // Array of shape (rows, cols)
        let row = new Array(this.cols).fill("");
        this.grid = Array.from(Array(this.rows), () => [...row]);
        this.squares = [];
        this.gameOver = false;
    }

    // squares and squares previews hold an arry in the following structure
    // [{x: int, y: int, type: string}]
    // Game retrieves it so driver can draw current placed squares
    getGridSquares() {
        return this.squares.concat(this.squaresPreview);
    }

    // squares make up a piece. Calculates given piece's x, y for hold preview
    generateHoldSquares(piece) {
        let xPos, yPos;
        let holdSquares = [];
        for (let i = 0; i < piece.span.length; i++) {
            xPos = this.centerHold.x + piece.span[i].x;
            yPos = this.centerHold.y + piece.span[i].y;
            holdSquares.push({
                x: xPos,
                y: yPos,
                type: piece.type
            })
        }
        return holdSquares;
    }

    // Calculates given piece's x, y for next preview
    generateNextSquares(pieces) {
        let xPos, yPos;
        let nextSquares = [];

        // Offsets 
        let centerX = this.centerNext.x
        let centerY = this.centerNext.y;

        pieces.forEach(piece => {
            centerY += 3;
            for (let i = 0; i < piece.span.length; i++) {
                xPos = centerX + piece.span[i].x;
                yPos = centerY + piece.span[i].y;
                nextSquares.push({
                    x: xPos,
                    y: yPos,
                    type: piece.type
                });
            }
        });
        return nextSquares;
    }

    // If there's a row in the grid with no empty squares (which means it's a full row)
    // Then clear that line from the grid
    // Starts at the top (y=0) and goes to the bottom
    clearLines() {
        for (let y = 0; y < this.rows; y++) {
            let x = 0;
            let hole = false;
            while ((x < this.cols) && (!hole)) {
                if (this.grid[y][x] === "") {
                    hole = true;
                }
                x++;
            }
            if (!hole) {
                this.clearLine(y);
                this.clearSquares(y);
            }
        }
    }

    // Clears that row in the grid and adds a new row on top. Example:
    //    ---------i                      ----------
    // y: xxxxxxxxxx  ->  ---------i  ->  ---------i
    //    o---------      o---------      o---------
    clearLine(y) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.cols).fill(""));
    }

    // Goes through each square and clears those on row y
    // If above row y then shift them down by 1
    clearSquares(y) {
        for (let i = this.squares.length - 1; i >= 0; i--) {
            if (this.squares[i].y === y) {
                this.squares.splice(i, 1);
            } else if (this.squares[i].y < y) {
                this.squares[i].y++;
            }
        }
    }

    valid(piece) {
        let xPos, yPos
        // Ensure every square of the piece is valid in the grid
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            // Can't be outside the walls
            if (xPos >= this.cols || xPos < 0) {
                return false;
            }
            // Can't be below the grid
            if (yPos >= this.rows) {
                return false;
            }
            // Can be above the grid, that's ok
            if (yPos < 0) {
                continue;
            }
            // Can't be on an occupied grid square
            if (this.grid[yPos][xPos] !== "") {
                return false;
            }
        }
        return true;
    }

    // Assuming piece is valid, places its squares on the grid
    place(piece) {
        let xPos, yPos;
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            this.placeSquare(xPos, yPos, piece.type)
        }
    }

    placeSquare(xPos, yPos, squareType) {
        // If a piece is placed above the ceiling then you lost - too bad.
        if (yPos < 0) {
            this.gameOver = true;
            return;
        }
        // Otherwise we assume it's a valid move :)
        // Validation is performed in the game with grid.valid
        this.grid[yPos][xPos] = squareType;
        this.squares.push({
            x: xPos,
            y: yPos,
            type: squareType
        });
    }

    // Sets the current piece's preview along where it would land if dropped
    setPreviewPieces(piece, dropPreview) {
        this.squaresPreview = [];
        if (dropPreview) {
            this.previewPiece(dropPreview);
        }
        this.previewPiece(piece);
    }

    previewPiece(piece) {
        let xPos, yPos;
        for (let i = 0; i < piece.span.length; i++) {
            xPos = piece.x + piece.span[i].x;
            yPos = piece.y + piece.span[i].y;
            // New pieces in the grid will always have squares above the grid
            if (yPos < 0) {
                continue;
            }
            // If new piece spawns on top of a placed piece then you lost
            if (this.grid[yPos][xPos] !== "") {
                this.gameOver = true;
                continue;
            }
            // Otherwise place the new piece (or current piece if moved and recalculating squares preview)
            this.previewSquare(xPos, yPos, piece.type);
        }
    }

    previewSquare(xPos, yPos, squareType) {
        this.squaresPreview.push({
            x: xPos,
            y: yPos,
            type: squareType
        });
    }

}
