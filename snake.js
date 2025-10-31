const canvas = document.querySelector(".bodycanvas");
const scoreEl = document.querySelector(".score");
const highEl = document.querySelector(".highscore");
const playBtn = document.getElementById("playBtn");
const overlayPlay = document.getElementById("overlayPlay");
const overlayGameOver = document.getElementById("overlayGameOver");
const restartBtn = document.getElementById("restartBtn");
const food = document.querySelector(".food");

let direction = "RIGHT";
let snake = [{ x: 10, y: 10 }];
let foodX, foodY;
let score = 0;
let highScore = localStorage.getItem("highSnakeScore") || 0;
let gameInterval;
let speed = 150;
let running = false;

highEl.textContent = `High: ${highScore}`;

function randomFood() {
  foodX = Math.floor(Math.random() * 20) + 1;
  foodY = Math.floor(Math.random() * 20) + 1;
  food.style.gridRow = foodY;
  food.style.gridColumn = foodX;
}

function drawSnake() {
  document.querySelectorAll(".snakePart").forEach(p => p.remove());
  snake.forEach((part, i) => {
    const el = document.createElement("div");
    el.classList.add("snakePart");
    el.style.gridRow = part.y;
    el.style.gridColumn = part.x;
    el.style.background = i === 0
      ? "linear-gradient(to bottom, #90ee90, #32cd32)"
      : "#00ff7f";
    canvas.appendChild(el);
  });
}

function updateGame() {
  let head = { ...snake[0] };
  if (direction === "UP") head.y--;
  else if (direction === "DOWN") head.y++;
  else if (direction === "LEFT") head.x--;
  else if (direction === "RIGHT") head.x++;

  // collision
  if (head.x < 1 || head.x > 20 || head.y < 1 || head.y > 20 ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === foodX && head.y === foodY) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highSnakeScore", highScore);
      highEl.textContent = `High: ${highScore}`;
    }
    if (speed > 60 && score % 5 === 0) {
      clearInterval(gameInterval);
      speed -= 10;
      gameInterval = setInterval(updateGame, speed);
    }
    randomFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

// Swipe controls for mobile
let startX, startY, endX, endY;
canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});
canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  endX = t.clientX;
  endY = t.clientY;
  const dx = endX - startX;
  const dy = endY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// Prevent scroll/refresh
document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

function startGame() {
  score = 0;
  scoreEl.textContent = "Score: 0";
  snake = [{ x: 10, y: 10 }];
  direction = "RIGHT";
  speed = 150;
  running = true;
  overlayPlay.style.display = "none";
  overlayGameOver.style.display = "none";
  randomFood();
  drawSnake();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, speed);
}

function gameOver() {
  clearInterval(gameInterval);
  running = false;
  overlayGameOver.style.display = "flex";
}

playBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

randomFood();
drawSnake();
