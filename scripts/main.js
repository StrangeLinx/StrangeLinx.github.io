import { Game } from "./game.js";
// Issues:
//   When appending minos to the matrixDiv, they are placed on top of the "empty" ones
//   The empty ones should be deleted
//   Too many unnecessary divs
//   This should be something compelted in CSS not JavaScript

const game = new Game();
const backgroundDiv = document.createElement("div");
const backgroundHoldDiv = document.createElement("div");
const backgroundNextDiv = document.createElement("div");
const holdDiv = document.getElementById("hold");
const matrixDiv = document.getElementById("matrix");
const nextDiv = document.getElementById("next");
let rows, cols;
let lastTime;
let inputQueue;

function initialize() {
    rows = game.getRows();
    cols = game.getCols();
    matrixDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    matrixDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    holdDiv.style.gridTemplateRows = `repeate${4}, 1fr)`;
    holdDiv.style.gridTemplateRows = `repeate${4}, 1fr)`;
    createBackgroundDiv();
    createBackgroundHoldDiv();
    createBackgroundNextDiv();
    lastTime = 0;
    inputQueue = [];
}

function createBackgroundDiv() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            backgroundDiv.appendChild(createMinoDiv(x, y, "empty"));
        }
    }
}

function createBackgroundHoldDiv() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < 5; x++) {
            backgroundHoldDiv.appendChild(createMinoDiv(x, y));
        }
    }
}

function createBackgroundNextDiv() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < 5; x++) {
            backgroundNextDiv.appendChild(createMinoDiv(x, y));
        }
    }
}

function main() {
    if (game.over()) {
        console.log("Game Over");
        return;
    }
    update();
    draw();
    window.requestAnimationFrame(main);
}

function update() {
    let move = getInput();
    if (move) {
        game.update(move);
    }
}

function draw() {
    if (!game.updated) {
        return;
    }
    matrixDiv.innerHTML = backgroundDiv.innerHTML;
    holdDiv.innerHTML = backgroundHoldDiv.innerHTML;
    nextDiv.innerHTML = backgroundNextDiv.innerHTML;
    drawMinos();
    drawHold();
    drawNext();
    game.setUpdated(false);
}

function drawHold() {
    game.getHoldMinos().forEach(mino => {
        holdDiv.appendChild(createMinoDiv(mino.x, mino.y, mino.type));
    });
}

function drawNext() {
    game.getNextMinos().forEach(mino => {
        nextDiv.appendChild(createMinoDiv(mino.x, mino.y, mino.type));
    });
}

function drawMinos() {
    game.getMinos().forEach(mino => {
        matrixDiv.appendChild(createMinoDiv(mino.x, mino.y, mino.type));
    });
}


function createMinoDiv(x, y, minoType) {
    const minoDiv = document.createElement("div");
    minoDiv.style.gridRowStart = y + 1;
    minoDiv.style.gridColumnStart = x + 1;
    minoDiv.classList.add(minoType);
    return minoDiv;
}

function getInput() {
    return inputQueue.shift();
}

function restart() {
    game.new();
    inputQueue = [];
    window.requestAnimationFrame(main);
}

window.addEventListener("keydown", ev => {
    if (ev.key === "ArrowLeft") {
        inputQueue.push({ type: "shift", x: -1, y: 0 });
    } else if (ev.key === "ArrowRight") {
        inputQueue.push({ type: "shift", x: 1, y: 0 });
    } else if (ev.key === "ArrowDown") {
        inputQueue.push({ type: "shift", x: 0, y: 1 });
    } else if (ev.key === "ArrowUp") {
        inputQueue.push({ type: "rotate", rot: 1 });
    } else if (ev.key.toUpperCase() === "X") {
        inputQueue.push({ type: "rotate", rot: -1 });
    } else if (ev.key.toUpperCase() === "C") {
        inputQueue.push({ type: "drop" });
    } else if (ev.key.toUpperCase() === "R") {
        restart();
    } else if (ev.key.toUpperCase() === "Z") {
        inputQueue.push({ type: "hold"});
    }
})

initialize();
window.requestAnimationFrame(main);