import Game from "./game.js";

const game = new Game();
const backgroundDiv = document.createElement("div");
const holdDiv = document.getElementById("hold");
const matrixDiv = document.getElementById("matrix");
const nextDiv = document.getElementById("next");
const menuDiv = document.getElementById("menu");
const controlsDiv = document.getElementById("controls");
const settingsDiv = document.getElementById("settings");

const controls = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    moveDown: "ArrowDown",
    moveDrop: "c",
    moveRotC: "ArrowUp",
    moveRotCC: "x",
    moveHold: "z",
    // Indexed to determine key held
    "ArrowLeft": false,
    "ArrowRight": false,
    "ArrowDown": false,
    "c": false,
    "ArrowUp": false,
    "x": false,
    "z": false,
    "r": false,
    "Escape": false,
    reserved: { r: true, Escape: true }
};

const moves = {
    left: { type: "shift", x: -1, y: 0 },
    right: { type: "shift", x: 1, y: 0 },
    down: { type: "shift", x: 0, y: 1 },
    rotC: { type: "rotate", rot: 1 },
    rotCC: { type: "rotate", rot: -1 },
    drop: { type: "drop" },
    hold: { type: "hold" }
}

const DASDEFAULT = 105;
const ARRDEFAULT = 1;
const SOFTDROPDEFAULT = 10
let das = DASDEFAULT;
let arr = ARRDEFAULT;
let soft = SOFTDROPDEFAULT;
let lastTime = 0;
let inputQueue = [];
let configureInput = false;
let keyPressed = "";

function initialize() {
    createBackgroundDiv();
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
    if (game.over()) {
        pause();
        return;
    }
    if (game.paused) {
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

function getInput() {
    return inputQueue.shift();
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

function restart() {
    game.new();
    resume();
}

function pauseOrResume() {
    // Configuring controls shouldn't pause or resume
    if (configureInput) {
        return;
    }
    // Controls and settings menu should return to main menu
    if (controlsDiv.style.display === "flex") {
        pause();
    } else if (settingsDiv.style.display === "flex") {
        configureSettings();
        pause();
    } else if (game.over()) {
        restart();
    } else if (!game.paused) {
        pause();
    } else {
        resume();
    }
}

function configureSettings() {
    const dasIn = document.getElementById("DASinput");
    const arrIn = document.getElementById("ARRinput");
    const softIn = document.getElementById("softInput");
    if (dasIn.value === "") {
        das = DASDEFAULT;
    } else if (!isNaN(parseFloat(dasIn.value)) && isFinite(dasIn.value)) {
        das = dasIn.value;
    }
    if (arrIn.value === "") {
        arr = ARRDEFAULT;
    } else if (!isNaN(parseFloat(arrIn.value)) && isFinite(arrIn.value)) {
        arr = arrIn.value;
    }
    if (softIn.value === "") {
        soft = SOFTDROPDEFAULT;
    } else if (!isNaN(parseFloat(softIn.value)) && isFinite(softIn.value)) {
        soft = softIn.value;
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

function moveSideways(key, move, oppKey) {

    // Cancel move
    // Ex: Holding left then pressing right should cancel moving left
    if (controls[oppKey] !== false) {
        clearTimeout(controls[oppKey]);
        controls[oppKey] = false;
    }

    controls[key] = true;
    doMove(move);
    controls[key] = setTimeout(accumulateMoveDAS, das, move, key);
}

function accumulateMoveDAS(move, key) {
    controls[key] = setTimeout(accumulateMoveARR, arr, move, key, arr);
}

function accumulateMoveARR(move, key, delay) {
    doMove(move);
    controls[key] = setTimeout(accumulateMoveARR, delay, move, key, delay);
}

function doMoveOnce(move, key) {
    controls[key] = true;
    doMove(move);
}

function doMove(move) {
    inputQueue.push(move);
}

function moveDown() {
    let key = controls.moveDown;
    controls[key] = true;
    accumulateMoveARR(moves.down, key, soft);
}

document.addEventListener("keydown", ev => {
    if (configureInput) {
        configureNewControl(ev.key);
        return;
    }
    if (!controls.hasOwnProperty(ev.key)) {
        return;
    } else if (ev.key === controls.moveLeft && controls[ev.key] === false) {
        moveSideways(ev.key, moves.left, controls.moveRight);
    } else if (ev.key === controls.moveRight && controls[ev.key] === false) {
        moveSideways(ev.key, moves.right, controls.moveLeft);
    } else if (ev.key === controls.moveDown && controls[ev.key] === false) {
        moveDown();
    } else if (ev.key === controls.moveRotC && controls[ev.key] === false) {
        doMoveOnce(moves.rotC, ev.key);
    } else if (ev.key === controls.moveRotCC && controls[ev.key] === false) {
        doMoveOnce(moves.rotCC, ev.key);
    } else if (ev.key === controls.moveDrop && controls[ev.key] === false) {
        doMoveOnce(moves.drop, ev.key);
    } else if (ev.key === controls.moveHold && controls[ev.key] === false) {
        doMoveOnce(moves.hold, ev.key);
    } else if (ev.key.toUpperCase() === "R") {
        restart();
    } else if (ev.key === "Escape") {
        pauseOrResume();
    }
});

document.addEventListener("keyup", ev => {
    if (controls[ev.key] !== false) {
        clearTimeout(controls[ev.key]);
        controls[ev.key] = false;
    }
})

document.getElementById("startButton").onclick = () => {
    if (game.over()) {
        restart();
    } else {
        resume();
    }
}

document.getElementById("controlsButton").onclick = () => {
    showControls();
}

function showControls() {
    menuDiv.style.display = "none";
    controlsDiv.style.display = "flex";
}

const gameControlButtons = document.querySelectorAll(".gameControlButton");
for (let i = 0; i < gameControlButtons.length; i++) {
    if (gameControlButtons[i].id === "controlsBackToMenu") {
        gameControlButtons[i].onclick = () => {
            pauseOrResume();
        };
    } else {
        gameControlButtons[i].onclick = () => {
            if (configureInput) {
                return;
            }
            configureInput = true;
            gameControlButtons[i].classList.add("gameControlButtonClicked");
            keyPressed = gameControlButtons[i];
        }
    }
}

function configureNewControl(key) {
    if (controls.reserved[key]) {
        keyPressed.classList.add("gameControlReserved");
        setTimeout(() => {
            keyPressed.classList.remove("gameControlReserved");
        }, 250);
        return;
    }

    // Remove old index and index new key
    let oldKey = controls[keyPressed.id];
    delete controls[oldKey]
    controls[key] = false;

    // Set new control
    controls[keyPressed.id] = key;
    keyPressed.classList.remove("gameControlButtonClicked");
    configureInput = false;
}

document.getElementById("settingsBackToMenu").onclick = () => {
    pauseOrResume();
}

document.getElementById("settingsButton").onclick = () => {
    settings();
}

function settings() {
    menuDiv.style.display = "none";
    settingsDiv.style.display = "flex";
}

document.querySelectorAll(".onlyNumbers").forEach(numBox => {
    // Only allow integers in the textbox fields
    numBox.onkeypress = ev => !isNaN(parseFloat(ev.key)) && isFinite(ev.key);
});

initialize();