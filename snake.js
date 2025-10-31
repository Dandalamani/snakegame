const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

let snake = [{ x: 9 * box, y: 10 * box }];
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

let direction;
let game;
let paused = false;

// =================== Swipe Controls (Mobile) ===================
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
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

// =================== Game Logic ===================

function draw() {
  if (paused) return;

  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "white";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // If snake eats food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  // Game Over Conditions
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Game Over! Your Score: " + score);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    resetGame();
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(segment => head.x === segment.x && head.y === segment.y);
}

function resetGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = undefined;
  score = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("highScore").innerText = highScore;
  document.getElementById("playBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("resumeBtn").disabled = true;
}

// =================== Button Controls ===================
document.getElementById("playBtn").addEventListener("click", () => {
  game = setInterval(draw, 120);
  document.getElementById("playBtn").disabled = true;
  document.getElementById("pauseBtn").disabled = false;
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = true;
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("resumeBtn").disabled = false;
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  paused = false;
  document.getElementById("pauseBtn").disabled = false;
  document.getElementById("resumeBtn").disabled = true;
});
