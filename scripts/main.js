import Game from "./game.js";

const game = new Game();
const backgroundDiv = document.createElement("div");
const holdDiv = document.getElementById("hold");
const matrixDiv = document.getElementById("matrix");
const nextDiv = document.getElementById("next");
let lastTime;
let inputQueue;

function initialize() {
    createBackgroundDiv();
    lastTime = 0;
    inputQueue = [];
}

function createBackgroundDiv() {
    for (let y = 0; y < game.getRows(); y++) {
        for (let x = 0; x < game.getCols(); x++) {
            backgroundDiv.appendChild(createMinoDiv(x, y, "empty"));
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
    if (game.updatedMatrix) {
        matrixDiv.innerHTML = backgroundDiv.innerHTML;
        drawMinos(matrixDiv, game.getMatrixMinos());
        game.setUpdatedMatrix(false);
    }
    if (game.updatedHold) {
        holdDiv.innerHTML = "";
        drawMinos(holdDiv, game.getHoldMinos());
        game.setUpdatedHold(false);
    }
    if (game.updatedNext) {
        nextDiv.innerHTML = "";
        drawMinos(nextDiv, game.getNextMinos());
        game.setUpdatedNext(false);
    }
}

function drawMinos(parentDiv, minos) {
    minos.forEach(mino => {
        parentDiv.appendChild(createMinoDiv(mino.x, mino.y, mino.type));
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
        inputQueue.push({ type: "hold" });
    }
})

initialize();
window.requestAnimationFrame(main);