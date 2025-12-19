const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const scoreBoard = document.getElementById("scoreBoard");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const replayBtn = document.getElementById("replayBtn");
const arrowButtons = document.querySelectorAll(".arrow-btn");

const box = 20;
let snake, food, direction, game, paused, score, highScore, speed;

highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;

// Initial Setup
canvas.style.display = "none";
scoreBoard.style.display = "none";
pauseBtn.style.display = "none";
resumeBtn.style.display = "none";
document.querySelector(".arrow-controls").style.display = "none";

function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  paused = false;

  // ⭐ MODERATE START SPEED
  speed = 300;

  spawnFood();
  scoreDisplay.textContent = score;

  gameOverScreen.style.display = "none";
  canvas.style.display = "block";
  scoreBoard.style.display = "block";
  pauseBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";
  document.querySelector(".arrow-controls").style.display = "flex";
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function draw() {
  if (paused) return;

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  const gradientFood = ctx.createRadialGradient(
    food.x + 10, food.y + 10, 2,
    food.x + 10, food.y + 10, 10
  );
  gradientFood.addColorStop(0, "#ffffff");
  gradientFood.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradientFood;
  ctx.beginPath();
  ctx.roundRect(food.x, food.y, box, box, 6);
  ctx.fill();

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ffcc" : "#00e6b8";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(snake[i].x, snake[i].y, box, box, 6);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // 🟢 Eat food
  if (headX === food.x && headY === food.y) {
    score++;
    scoreDisplay.textContent = score;
    spawnFood();

    // ⭐ SMOOTH SPEED INCREASE
    if (score % 5 === 0 && speed > 130) {
      clearInterval(game);
      speed -= 5; // gentle increase
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // ❌ Collision detection
  if (
    headX < 0 || headY < 0 ||
    headX >= canvas.width || headY >= canvas.height ||
    snake.some(s => s.x === newHead.x && s.y === newHead.y)
  ) {
    clearInterval(game);
    handleGameOver();
    return;
  }

  snake.unshift(newHead);
}

function handleGameOver() {
  finalScore.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  highScoreDisplay.textContent = highScore;

  scoreBoard.style.display = "none";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  document.querySelector(".arrow-controls").style.display = "none";
  gameOverScreen.style.display = "flex";
}

// ▶ Play / Replay
playBtn.addEventListener("click", () => {
  initGame();
  playBtn.style.display = "none";
  clearInterval(game);
  game = setInterval(draw, speed);
});

replayBtn.addEventListener("click", () => {
  initGame();
  gameOverScreen.style.display = "none";
  clearInterval(game);
  game = setInterval(draw, speed);
});

// ⏸ Pause / Resume
pauseBtn.addEventListener("click", () => {
  paused = true;
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "inline-block";
});

resumeBtn.addEventListener("click", () => {
  paused = false;
  pauseBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";
});

// 📱 On-screen Arrow Buttons
arrowButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const dir = btn.getAttribute("data-dir");
    if (
      (dir === "UP" && direction !== "DOWN") ||
      (dir === "DOWN" && direction !== "UP") ||
      (dir === "LEFT" && direction !== "RIGHT") ||
      (dir === "RIGHT" && direction !== "LEFT")
    ) {
      direction = dir;
      draw();
    }
  });
});

// ⌨ Keyboard Controls (Desktop)
document.addEventListener("keydown", (e) => {
  if (paused) return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// 📱 Swipe Controls
let touchStartX = 0, touchStartY = 0;

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < -30 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 30 && direction !== "UP") direction = "DOWN";
    else if (dy < -30 && direction !== "DOWN") direction = "UP";
  }
});

// Rounded Rectangle Helper
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
