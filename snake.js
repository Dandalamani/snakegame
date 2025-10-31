/* Mobile-first Snake game
   - grid 20x20
   - white food
   - score/highscore large
   - initial slow for first 10 points, then speed up every 5 points
   - pause/resume + play/restart
   - prevents pull-to-refresh
*/

const GRID = 20;
const board = document.getElementById("board");
const foodEl = document.getElementById("food");
const scoreEl = document.getElementById("score");
const highEl = document.getElementById("highscore");
const overlayPlay = document.getElementById("overlayPlay");
const overlayGameOver = document.getElementById("overlayGameOver");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("gameOverBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

let snake = [{x: 10, y: 10}];
let dir = "RIGHT";
let food = {x: 5, y: 5};
let score = 0;
let highScore = parseInt(localStorage.getItem("snakeHigh")) || 0;
highEl.textContent = `High: ${highScore}`;

let intervalId = null;
let baseSpeed = 220;   // slow start
let speed = baseSpeed;
let running = false;
let paused = false;

/* Prevent scroll/pull-to-refresh on mobile while game is active */
document.body.addEventListener('touchmove', e => {
  if (running) e.preventDefault();
}, {passive:false});

/* Helper: place food at random free cell */
function placeFood(){
  let tries = 0;
  while(true && tries < 1000){
    tries++;
    const fx = Math.floor(Math.random()*GRID)+1;
    const fy = Math.floor(Math.random()*GRID)+1;
    if (!snake.some(s=>s.x===fx && s.y===fy)){
      food = {x:fx,y:fy};
      // position absolute food element using grid coordinates:
      const cellW = board.clientWidth / GRID;
      const cellH = board.clientHeight / GRID;
      foodEl.style.left = `${(food.x-1)*cellW}px`;
      foodEl.style.top  = `${(food.y-1)*cellH}px`;
      return;
    }
  }
}

/* Draw snake cells (we create DIVs inside board) */
function draw(){
  // remove previous snake cells
  board.querySelectorAll(".snake-cell").forEach(n=>n.remove());
  // draw each part
  for(let i=0;i<snake.length;i++){
    const p = snake[i];
    const d = document.createElement("div");
    d.className = "snake-cell";
    d.style.gridColumn = p.x;
    d.style.gridRow = p.y;
    // color head differently
    d.style.background = (i===0) ? "linear-gradient(to bottom,#b7ffb7,#00c853)" : "#00ff7f";
    board.appendChild(d);
  }
}

/* Update loop */
function step(){
  if (!running || paused) return;
  let head = {...snake[0]};
  if (dir === "UP") head.y--;
  if (dir === "DOWN") head.y++;
  if (dir === "LEFT") head.x--;
  if (dir === "RIGHT") head.x++;

  // wall collision
  if (head.x < 1 || head.x > GRID || head.y < 1 || head.y > GRID){
    return onGameOver();
  }
  // self collision
  for(let i=0;i<snake.length;i++){
    if (snake[i].x === head.x && snake[i].y === head.y) return onGameOver();
  }

  snake.unshift(head);

  // food eaten
  if (head.x === food.x && head.y === food.y){
    score++;
    scoreEl.textContent = `Score: ${score}`;
    if (score > highScore){
      highScore = score;
      localStorage.setItem("snakeHigh", highScore);
      highEl.textContent = `High: ${highScore}`;
    }

    // speed logic:
    // first 10 points — remain slow (baseSpeed)
    // after score >= 10, every 5 points decrease delay by 15ms (faster)
    if (score >= 10){
      const extraSteps = Math.floor((score - 10)/5);
      speed = Math.max(70, baseSpeed - extraSteps * 15);
      clearInterval(intervalId);
      intervalId = setInterval(step, speed);
    }

    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

/* Start / restart / pause / resume */
function startGame(){
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
  snake = [{x:10,y:10}];
  dir = "RIGHT";
  running = true;
  paused = false;
  overlayPlay.style.display = "none";
  overlayGameOver.style.display = "none";
  baseSpeed = 220; // slow starting speed
  speed = baseSpeed;
  clearInterval(intervalId);
  intervalId = setInterval(step, speed);
  placeFood();
  draw();
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
}
function onGameOver(){
  running = false;
  paused = false;
  clearInterval(intervalId);
  overlayGameOver.style.display = "flex";
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
}
function pauseGame(){
  if (!running || paused) return;
  paused = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
}
function resumeGame(){
  if (!running || !paused) return;
  paused = false;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
}

/* Touch swipe controls */
let sX=0,sY=0,eX=0,eY=0;
board.addEventListener("touchstart", e=>{
  const t = e.touches[0];
  sX = t.clientX; sY = t.clientY;
}, {passive:true});

board.addEventListener("touchend", e=>{
  const t = e.changedTouches[0];
  eX = t.clientX; eY = t.clientY;
  if (!running || paused) return;
  const dx = eX - sX, dy = eY - sY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // tiny swipe: ignore
  if (Math.abs(dx) > Math.abs(dy)){
    if (dx > 0 && dir !== "LEFT") dir = "RIGHT";
    else if (dx < 0 && dir !== "RIGHT") dir = "LEFT";
  } else {
    if (dy > 0 && dir !== "UP") dir = "DOWN";
    else if (dy < 0 && dir !== "DOWN") dir = "UP";
  }
}, {passive:true});

/* Keyboard fallback */
window.addEventListener("keydown", e=>{
  if (!running) return;
  if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
  else if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
  else if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
  else if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
});

/* Resize / reposition food on orientation change */
window.addEventListener("resize", ()=>{
  // reposition food element to align with grid after resize
  placeFood();
});

/* Buttons */
playBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", ()=>{ overlayGameOver.style.display = "none"; startGame(); });
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);

/* Initial render */
placeFood();
draw();
overlayPlay.style.display = "flex";
pauseBtn.disabled = true;
resumeBtn.disabled = true;
