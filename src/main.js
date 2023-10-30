// Define constants for the game
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
let score = 0;
let gameActive = false; // Flag to track if the game is active

// Define the tetrominoes and their shapes
const tetrominoes = {
  I: {
    shape: [
      [1, 1, 1, 1],
    ],
    color: 'cyan',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'yellow',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'purple',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'orange',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'blue',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'green',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'red',
  },
};

// Function to draw a tetromino on the game board
function drawTetromino(tetromino, x, y) {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let col = 0; col < tetromino.shape[row].length; col++) {
      if (tetromino.shape[row][col]) {
        drawSquare(x + col, y + row, tetromino.color);
      }
    }
  }
}

function drawSquare(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = '#333';
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Define a game board using a 2D array.
const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

// Function to check for collisions
function isCollision(x, y, shape) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = x + col;
        const boardY = y + row;
        if (
          boardY >= ROWS ||
          boardX < 0 ||
          boardX >= COLUMNS ||
          (board[boardY] && board[boardY][boardX] !== 0)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Function to merge the current tetromino into the game board
function mergeTetromino() {
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        const boardX = currentX + col;
        const boardY = currentY + row;
        if (board[boardY]) {
          board[boardY][boardX] = currentTetromino.color;
        }
      }
    }
  }
}

// Function to rotate a tetromino
function rotateTetromino() {
  const rotated = [];
  for (let row = 0; row < currentTetromino.shape[0].length; row++) {
    const newRow = [];
    for (let col = currentTetromino.shape.length - 1; col >= 0; col--) {
      newRow.push(currentTetromino.shape[col][row]);
    }
    rotated.push(newRow);
  }
  return rotated;
}

// Function to move the current tetromino
function moveTetromino(dx, dy) {
  if (!isCollision(currentX + dx, currentY + dy, currentTetromino.shape)) {
    currentX += dx;
    currentY += dy;
  }
}

// Handle keyboard input for moving and rotating the tetromino
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    moveTetromino(-1, 0); // Move left
  } else if (event.key === 'ArrowRight') {
    moveTetromino(1, 0); // Move right
  } else if (event.key === 'ArrowDown') {
    moveTetromino(0, 1); // Move down
  } else if (event.key === 'ArrowUp') {
    const rotatedTetromino = rotateTetromino();
    if (!isCollision(currentX, currentY, rotatedTetromino)) {
      currentTetromino.shape = rotatedTetromino; // Rotate
    }
  }
});

// Function to clear the game board
function clearBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      board[row][col] = 0;
    }
  }
}

// Function to update and display the score
function updateScore() {
  const scoreElement = document.getElementById('score');
  scoreElement.innerHTML = `Score: ${score}`;
}

// Function to remove full lines and update score
function removeFullLines() {
  let linesCleared = 0;
  for (let row = ROWS - 1; row >= 0; row--) {
    let isRowFull = true;
    for (let col = 0; col < COLUMNS; col++) {
      if (board[row][col] === 0) {
        isRowFull = false;
        break;
      }
    }
    if (isRowFull) {
      for (let r = row; r > 0; r--) {
        for (let c = 0; c < COLUMNS; c++) {
          board[r][c] = board[r - 1][c];
        }
      }
      linesCleared++;
      score += COLUMNS;
      row++;
    }
  }
  updateScore();
}

let gameLoopTimeout;

// Function to start the game loop
function startGameLoop() {
  if (gameActive) {
    fallingBlockTimeout = setTimeout(controlFalling, fallingSpeed); // Start controlling the falling block
    gameLoop(); // Start the game loop
  }
}

// Function to start the game
function startGame() {
  if (!gameActive) {
    quitGame(); // Ensure previous game state is properly reset
    gameActive = true;
    clearBoard();
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    currentTetromino = getRandomTetromino();
    currentX = Math.floor(COLUMNS / 2) - Math.floor(currentTetromino.shape[0].length / 2);
    currentY = 0;
    startGameLoop(); // Start the game loop

    // Start the falling block after game restart
    controlFalling();
  }
}

// Function to quit the game
function quitGame() {
  gameActive = false;
  clearFallingBlockTimeout(); // Clear the falling block timeout
  clearBoard();
  score = 0;
  updateScore();
  context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Reset the current tetromino
  currentTetromino = null;
  currentX = 0;
  currentY = 0;
}

// Additional event listeners for buttons
document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startButton');
  const quitButton = document.getElementById('quitButton');

  startButton.addEventListener('click', startGame); // Call startGame function when the button is clicked

  quitButton.addEventListener('click', quitGame);
});

// Function to generate a random tetromino
function getRandomTetromino() {
  const tetrominoNames = Object.keys(tetrominoes);
  const randomIndex = Math.floor(Math.random() * tetrominoNames.length);
  const randomTetrominoName = tetrominoNames[randomIndex];
  return { ...tetrominoes[randomTetrominoName] };
}

// Define falling speed in milliseconds
const fallingSpeed = 500; // 1 second for each block to fall
let fallingBlockTimeout; // Track the falling block timeout
let isFalling = false; // Flag to check if block is falling

// Function to control the falling of the tetromino
function controlFalling() {
  if (gameActive && !isFalling) {
    isFalling = true;
    fallingBlockTimeout = setTimeout(() => {
      isFalling = false;
      if (!isCollision(currentX, currentY + 1, currentTetromino.shape)) {
        currentY++;
        controlFalling(); // Check for next block falling
      } else {
        isFalling = false;
        mergeTetromino(); // Merge the tetromino with the game board

        if (isGameOver()) { // Check for game over after merging
          gameActive = false;
          handleGameOver();
          return;
        }

        currentTetromino = getRandomTetromino();
        currentX = Math.floor(COLUMNS / 2) - Math.floor(currentTetromino.shape[0].length / 2);
        currentY = 0;
        controlFalling(); // Start the next block falling
      }
      removeFullLines(); // Check for and remove any full lines
    }, fallingSpeed);
  }
}

function clearFallingBlockTimeout() {
  clearTimeout(fallingBlockTimeout);
}

// Function to quit the game
function quitGame() {
  gameActive = false;
  clearBoard();
  score = 0;
  updateScore();
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to update the game state and redraw the game at 60 FPS
function gameLoop() {
  if (gameActive) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        if (board[row][col]) {
          drawSquare(col, row, board[row][col]);
        }
      }
    }

    drawTetromino(currentTetromino, currentX, currentY);
    updateScore();

    if (!isGameOver()) {
      requestAnimationFrame(gameLoop);
    } else {
      handleGameOver();
    }
  }
}

// Function to check for game over
function checkGameOver() {
  if (!gameActive && isGameOver()) {
    context.fillStyle = "red";
    context.font = "40px Arial";
    const text = "Game Over";
    const textWidth = context.measureText(text).width;
    context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
  }

  setTimeout(checkGameOver, fallingSpeed);
}

// Function to check if the game is over
function isGameOver() {
  return currentY <= 0 && isCollision(currentX, currentY, currentTetromino.shape);
}

// Function to handle the game over scenario
function handleGameOver() {
  if (!gameActive && isGameOver()) {
    context.fillStyle = "red";
    context.font = "40px Arial";
    const text = "Game Over";
    const textWidth = context.measureText(text).width;
    context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
  }
}

// Start the game loop when the page loads
startGame();