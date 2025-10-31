const food = document.querySelector(".food");
const bodyCanvas = document.querySelector(".bodycanvas");
const scoreSpan = document.querySelector(".score");
const highScoreSpan = document.querySelector(".highscore");
const playBtn = document.getElementById("playBtn");
const overlayPlay = document.getElementById("overlayPlay");
const overlayGameOver = document.getElementById("overlayGameOver");
const gameOverBtn = document.getElementById("gameOverBtn");

let foodx, foody;
let direction = "RIGHT";
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreSpan.textContent = "High Score: " + highScore;

let snakeBody = [{ x: 6, y: 1 }];
let gameInterval = null;
let speed = 150;
let isGameRunning = false;

/* 🧩 Prevent pull-to-refresh and scrolling on mobile */
bodyCanvas.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

bodyCanvas.addEventListener("touchstart", function (e) {
  if (e.touches.length > 1) e.preventDefault(); // disable zoom pinch
}, { passive: false });

// random food
function randomFood() {
  foodx = Math.floor(Math.random() * 30) + 1;
  foody = Math.floor(Math.random() * 30) + 1;
  food.style.gridRow = foody;
  food.style.gridColumn = foodx;
}

// draw snake
function drawSnake() {
  document.querySelectorAll(".snakePart").forEach(el => el.remove());
  snakeBody.forEach((part, index) => {
    const partDiv = document.createElement("div");
    partDiv.classList.add("snakePart");
    partDiv.style.gridRow = part.y;
    partDiv.style.gridColumn = part.x;
    partDiv.style.background =
      index === 0
        ? "linear-gradient(to bottom, #a6ff00, #00ff7f)"
        : "linear-gradient(to bottom, #32cd32, #7cfc00)";
    bodyCanvas.appendChild(partDiv);
  });
}

// keyboard controls (for desktop)
document.addEventListener("keydown", (e) => {
  if (!isGameRunning) return;
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// swipe controls (for mobile)
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

bodyCanvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

bodyCanvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
});

bodyCanvas.addEventListener("touchend", () => {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (!isGameRunning) return;

  if (Math.max(absX, absY) > 30) {
    if (absX > absY) {
      if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
      else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
    } else {
      if (dy > 0 && direction !== "UP") direction = "DOWN";
      else if (dy < 0 && direction !== "DOWN") direction = "UP";
    }
  }
});

// update loop
function updateGame() {
  let headX = snakeBody[0].x;
  let headY = snakeBody[0].y;

  if (direction === "UP") headY -= 1;
  else if (direction === "DOWN") headY += 1;
  else if (direction === "LEFT") headX -= 1;
  else if (direction === "RIGHT") headX += 1;

  let newHead = { x: headX, y: headY };

  if (headX < 1 || headX > 30 || headY < 1 || headY > 30) return gameOver();

  for (let part of snakeBody) {
    if (part.x === newHead.x && part.y === newHead.y) return gameOver();
  }

  snakeBody.unshift(newHead);

  if (newHead.x === foodx && newHead.y === foody) {
    score++;
    scoreSpan.textContent = "Score: " + score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      highScoreSpan.textContent = "High Score: " + highScore;
    }

    if (score % 10 === 0 && speed > 50) {
      speed -= 10;
      clearInterval(gameInterval);
      gameInterval = setInterval(updateGame, speed);
    }

    randomFood();
  } else {
    snakeBody.pop();
  }

  drawSnake();
}

function startGame() {
  score = 0;
  scoreSpan.textContent = "Score: " + score;
  direction = "RIGHT";
  snakeBody = [{ x: 6, y: 1 }];
  speed = 150;
  randomFood();
  drawSnake();

  overlayPlay.style.display = "none";
  overlayGameOver.style.display = "none";
  isGameRunning = true;

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, speed);
}

function gameOver() {
  clearInterval(gameInterval);
  isGameRunning = false;
  overlayGameOver.style.display = "flex";
}

playBtn.addEventListener("click", startGame);
gameOverBtn.addEventListener("click", startGame);

randomFood();
drawSnake();
