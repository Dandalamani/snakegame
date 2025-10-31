const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const scoreBoard = document.getElementById("scoreBoard");

const box = 20;
let snake, food, direction, game, paused, score, highScore;

highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;

// Initialize Game
function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = undefined;
  score = 0;
  paused = false;
  spawnFood();
  scoreDisplay.textContent = score;
}

// Food Generator
function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

// Draw Elements
function draw() {
  if (paused) return;

  // Background
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food
  const gradientFood = ctx.createRadialGradient(
    food.x + 10, food.y + 10, 2,
    food.x + 10, food.y + 10, 10
  );
  gradientFood.addColorStop(0, "#ffffff");
  gradientFood.addColorStop(1, "#ffffffff");
  ctx.fillStyle = gradientFood;
  ctx.beginPath();
  ctx.roundRect(food.x, food.y, box, box, 6);
  ctx.fill();

  // Snake
  for (let i = 0; i < snake.length; i++) {
    const segmentColor = i === 0 ? "#00ffcc" : "#00e6b8";
    ctx.fillStyle = segmentColor;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8;
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

  // Eat Food
  if (headX === food.x && headY === food.y) {
    score++;
    scoreDisplay.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // Collision
  if (
    headX < 0 || headY < 0 ||
    headX >= canvas.width || headY >= canvas.height ||
    snake.some(s => s.x === newHead.x && s.y === newHead.y)
  ) {
    clearInterval(game);
    alert("💥 Game Over! Your Score: " + score);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    highScoreDisplay.textContent = highScore;
    resetMenu();
    return;
  }

  snake.unshift(newHead);
}

// Reset Menu
function resetMenu() {
  playBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  scoreBoard.style.display = "none";
  canvas.style.display = "none";
}

// Play Button
playBtn.addEventListener("click", () => {
  initGame();
  canvas.style.display = "block";
  scoreBoard.style.display = "block";
  playBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";
  game = setInterval(draw, 120);
});

// Pause/Resume
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

// Swipe Controls (Mobile)
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  touchEndX = t.clientX;
  touchEndY = t.clientY;
  handleSwipe();
});

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < -30 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 30 && direction !== "UP") direction = "DOWN";
    else if (dy < -30 && direction !== "DOWN") direction = "UP";
  }
}

// Helper: Rounded rectangles
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
