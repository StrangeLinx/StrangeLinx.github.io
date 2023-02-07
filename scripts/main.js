import Game from "./game.js";

const game = new Game();
const backgroundDiv = document.createElement("div");
const holdDiv = document.getElementById("hold");
const matrixDiv = document.getElementById("matrix");
const nextDiv = document.getElementById("next");
const menuDiv = document.getElementById("menu");
const controlsDiv = document.getElementById("controls");
const settingsDiv = document.getElementById("settings");
const gameControls = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    moveDown: "ArrowDown",
    moveDrop: "c",
    moveRotC: "ArrowUp",
    moveRotCC: "x",
    moveHold: "z"    
};


let lastTime;
let inputQueue;
let configureInputPressed;
let configureInputButton;

function initialize() {
    createBackgroundDiv();
    lastTime = 0;
    inputQueue = [];
    configureInputPressed = false;
    configureInputButton = "";
    draw();
}

function createBackgroundDiv() {
    for (let y = 0; y < game.getRows(); y++) {
        for (let x = 0; x < game.getCols(); x++) {
            backgroundDiv.appendChild(createMinoDiv(x, y, "empty"));
        }
    }
}

function main() {
    if (game.over() || game.paused) {
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

function pauseResume() {
    // Controls and settings menu should return to main menu
    if (controlsDiv.style.display !== "none") {
        pause();
    } else if (settingsDiv.style.display !== "none") {
        pause();
    } else if (!game.paused) {
        pause();
    } else {
        resume();
    }
}

function pause() {
    game.pause();
    controlsDiv.style.display = "none";
    settingsDiv.style.display = "none";
    menuDiv.style.display = "flex";
    
}

function resume() {
    game.resume();
    controlsDiv.style.display = "none";
    settingsDiv.style.display = "none";
    menuDiv.style.display = "none";
    inputQueue = [];
    window.requestAnimationFrame(main);
}

function controls() {
    menuDiv.style.display = "none";
    controlsDiv.style.display = "flex";
}

window.addEventListener("keydown", ev => {
    if (configureInputPressed) {
        configureInputButton.classList.remove("gameControlButtonClicked");
        configureInputPressed = false;
    }
    if (ev.key === gameControls.moveLeft) {
        inputQueue.push({ type: "shift", x: -1, y: 0 });
    } else if (ev.key === gameControls.moveRight) {
        inputQueue.push({ type: "shift", x: 1, y: 0 });
    } else if (ev.key === gameControls.moveDown) {
        inputQueue.push({ type: "shift", x: 0, y: 1 });
    } else if (ev.key === gameControls.moveRotC) {
        inputQueue.push({ type: "rotate", rot: 1 });
    } else if (ev.key === gameControls.moveRotCC) {
        inputQueue.push({ type: "rotate", rot: -1 });
    } else if (ev.key === gameControls.moveDrop) {
        inputQueue.push({ type: "drop" });
    } else if (ev.key === gameControls.moveHold) {
        inputQueue.push({ type: "hold" });
    } else if (ev.key.toUpperCase() === "R") {
        restart();
    } else if (ev.key === "Escape") {
        pauseResume();
    }
})

document.getElementById("startButton").onclick = () => {
    resume();
}

document.getElementById("controlsButton").onclick = () => {
    controls();
}

document.querySelectorAll(".gameControlButton").forEach(button => {
    button.onclick = () => {
        if (configureInputPressed) {
            return;
        }
        configureInputPressed = true;
        button.classList.add("gameControlButtonClicked");
        configureInputButton = button;
    }
});

initialize();