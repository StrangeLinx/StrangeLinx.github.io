import Game from "./game.js";

// Retrieve game elements to draw on
const backgroundDiv = document.createElement("div");
const holdDiv = document.getElementById("hold");
const gridDiv = document.getElementById("grid");
const nextDiv = document.getElementById("next");

// Menu elements
const menuDiv = document.getElementById("menu");
const controlsDiv = document.getElementById("controls");
const settingsDiv = document.getElementById("settings");
let configureInput = false;  // Determines if button is pressed in controls menu


// Main game
const game = new Game();
let lastTime = 0;
let inputQueue = [];  // Captures users input


// Controls to move the pieces
// Includes reserved control keys.
// Two main uses
//   1 - map user input to a move
//   2 - determine if key user pressed is being held
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

    // Reserved for restarting and pausing
    "r": false,
    "Escape": false,
    reserved: { r: true, Escape: true }
};

// Set of valid moves
const moves = {
    left: { type: "shift", x: -1, y: 0 },
    right: { type: "shift", x: 1, y: 0 },
    down: { type: "shift", x: 0, y: 1 },
    rotC: { type: "rotate", rot: 1 },
    rotCC: { type: "rotate", rot: -1 },
    drop: { type: "drop" },
    hold: { type: "hold" }
}

// How fast pieces moves (measured in ms)
//     L/R Speed is how fast the left/right move is repeated
//     L/R Speed delay is delay between first key press and repeating L/R move
//     Down speed is how fast the down move is repeated
const LEFT_RIGHT_SPEED_DEFAULT = 1;
const LEFT_RIGHT_SPEED_DELAY_DEFAULT = 105;
const DOWN_SPEED_DEFAULT = 10
let lrsd = LEFT_RIGHT_SPEED_DELAY_DEFAULT;
let lrs = LEFT_RIGHT_SPEED_DEFAULT;
let ds = DOWN_SPEED_DEFAULT;
let keyPressed = "";

// Game starts off as paused. Draw the background.
function initialize() {
    createBackgroundDiv();
    draw();
}

function createBackgroundDiv() {
    for (let y = 0; y < game.getRows(); y++) {
        for (let x = 0; x < game.getCols(); x++) {
            backgroundDiv.appendChild(createSquareDiv(x, y, "empty"));
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

// Retrieve user input and update the game accordingly
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
    if (game.updatedGrid) {
        gridDiv.innerHTML = backgroundDiv.innerHTML;
        drawSquares(gridDiv, game.getGridSquares());
        game.setUpdatedGrid(false);
    }
    if (game.updatedHold) {
        holdDiv.innerHTML = "";
        drawSquares(holdDiv, game.getHoldSquares());
        game.setUpdatedHold(false);
    }
    if (game.updatedNext) {
        nextDiv.innerHTML = "";
        drawSquares(nextDiv, game.getNextSquares());
        game.setUpdatedNext(false);
    }
}

function drawSquares(parentDiv, squares) {
    squares.forEach(square => {
        parentDiv.appendChild(createSquareDiv(square.x, square.y, square.type));
    });
}

function createSquareDiv(x, y, squareType) {
    const squareDiv = document.createElement("div");
    squareDiv.style.gridRowStart = y + 1;
    squareDiv.style.gridColumnStart = x + 1;
    squareDiv.classList.add(squareType);
    return squareDiv;
}

function restart() {
    game.new();
    resume();
}

function pauseOrResume() {
    // Actively configuring controls shouldn't pause or resume
    if (configureInput) {
        return;
    }
    // Controls and settings menu should return to main menu
    if (controlsDiv.style.display === "flex") {
        pause();
    } else if (settingsDiv.style.display === "flex") {
        configureSettings();
        pause();
    // If the user lost they're brought to the main menu
    } else if (game.over()) {
        restart();
    } else if (!game.paused) {
        pause();
    } else {
        resume();
    }
}

// User can configure the following in the settings menu
//    Left/Right speed
//    Left/Right speed delay
//    Down move speed
function configureSettings() {
    const lrsdIn = document.getElementById("LRSDinput");
    const lrsIn = document.getElementById("LRSinput");
    const dsIn = document.getElementById("DSinput");
    if (lrsIn.value === "") {
        lrs = LEFT_RIGHT_SPEED_DEFAULT;
    } else if (!isNaN(parseFloat(lrsIn.value)) && isFinite(lrsIn.value)) {
        lrs = lrsIn.value;
    }
    if (lrsdIn.value === "") {
        lrsd = LEFT_RIGHT_SPEED_DELAY_DEFAULT;
    } else if (!isNaN(parseFloat(lrsdIn.value)) && isFinite(lrsdIn.value)) {
        lrsd = lrsdIn.value;
    }
    if (dsIn.value === "") {
        ds = DOWN_SPEED_DEFAULT;
    } else if (!isNaN(parseFloat(dsIn.value)) && isFinite(dsIn.value)) {
        ds = dsIn.value;
    }
}

function pause() {
    game.pause();
    controlsDiv.style.display = "none";
    settingsDiv.style.display = "none";
    menuDiv.style.display = "flex"; // show the main menu

}

function resume() {
    game.resume();
    // hide all menus and reset inputs so game doesn't auto-play
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

    // Delay before the move starts repeating 
    controls[key] = setTimeout(accumulateMove, lrsd, move, key, lrs);
}

// Move and repeat where delay is timebetween each repeat
function accumulateMove(move, key, delay) {
    doMove(move);
    controls[key] = setTimeout(accumulateMove, delay, move, key, delay);
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
    accumulateMove(moves.down, key, ds);
}

document.addEventListener("keydown", ev => {
    if (configureInput) {
        configureNewControl(ev.key);
        return;
    }
    if (!controls.hasOwnProperty(ev.key)) {
        return;
    // Prevent event listener from adding it's own key pressed repeat by
    // checking if key is being held already.
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
    // Once user lifts up key then cancel all move repeats by clearing active timeouts
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
    // User clicking on the "done" button should return to menu
    if (gameControlButtons[i].id === "controlsDone") {
        gameControlButtons[i].onclick = () => {
            pauseOrResume();
        };

    // User clicking on a configure control button should make button "active"
    // This lets user know to click on a key
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
    // Don't allow configuring a control on a reserved key
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

// User clicking on the "done" button should return to menu
document.getElementById("settingsDone").onclick = () => {
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
    // Restrict to integers in the textbox fields
    numBox.onkeypress = ev => !isNaN(parseFloat(ev.key)) && isFinite(ev.key);
});

initialize();