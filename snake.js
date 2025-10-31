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

/* Disable pull-to-refresh and scroll */
document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
document.body.addEventListener("touchstart", e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

function randomFood() {
  foodx = Math.floor(Math.random() * 30) + 1;
  foody = Math.floor(Math.random() * 30) + 1;
  food.style.gridColumn = foodx;
  food.style.gridRow = foody;
}

function drawSnake() {
  document.querySelectorAll(".snakePart").forEach(el => el.remove());
  snakeBody.forEach((part, index) => {
    const div = document.createElement("div");
    div.classList.add("snakePart");
    div.style.gridColumn = part.x;
    div.style.gridRow = part.y;
    div.style.background =
      index === 0
        ? "linear-gradient(to bottom, #a6ff00, #00ff7f)"
        : "linear-gradient(to bottom, #32cd32, #7cfc00)";
    bodyCanvas.appendChild(div);
  });
}

document.addEventListener("keydown", (e) => {
  if (!isGameRunning) return;
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/* Swipe controls for mobile */
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

bodyCanvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

bodyCanvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  touchEndX = t.clientX;
  touchEndY = t.clientY;
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

function updateGame() {
  let head = { ...snakeBody[0] };
  if (direction === "UP") head.y -= 1;
  else if (direction === "DOWN") head.y += 1;
  else if (direction === "LEFT") head.x -= 1;
  else if (direction === "RIGHT") head.x += 1;

  if (head.x < 1 || head.x > 30 || head.y < 1 || head.y > 30)
    return gameOver();

  for (let p of snakeBody)
    if (p.x === head.x && p.y === head.y) return gameOver();

  snakeBody.unshift(head);
  if (head.x === foodx && head.y === foody) {
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
  overlayPlay.classList.remove("active");
  overlayGameOver.classList.remove("active");
  isGameRunning = true;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, speed);
}

function gameOver() {
  clearInterval(gameInterval);
  isGameRunning = false;
  overlayGameOver.classList.add("active");
}

playBtn.addEventListener("click", startGame);
gameOverBtn.addEventListener("click", startGame);

randomFood();
drawSnake();
