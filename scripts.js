// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// sprites
const image = document.getElementById('ship');
const bkgStars = document.getElementById('stars');
const bullet = document.getElementById('bullet');
const mob1 = document.getElementById('mob1');
const mob2 = document.getElementById('mob2');
const mob3 = document.getElementById('mob3');
const mob_destroyed = document.getElementById('mob_destroyed');
const game_logo = document.getElementById('game_logo');

// draw sprites
// old ship dimensions
const shipHeight = 130;
const shipWidth = 80;
let shipX = (canvas.width - shipWidth) / 2;
console.log('canvas width: ', canvas.width);
const drawShip = () => {
  ctx.drawImage(
    image,
    shipX,
    canvas.height - shipHeight,
    shipWidth,
    shipHeight
  );
};
const drawStars = () => {
  ctx.drawImage(bkgStars, 0, 0, canvas.width, canvas.height);
};

// handle key press
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let bulletFrameCounter = 0;
// const bulletFrameCooldown = 50;
const bulletFrameCooldown = 40;
let pause = false; // pause / unpause game
const handleKeyDown = (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === ' ' || e.key === 'Spacebar') {
    // sets a cooldown for shooting a bullet
    if (bulletFrameCounter > bulletFrameCooldown) {
      spacePressed = true;
      bulletFrameCounter = 0;
    }
  } else if (e.key === 'p' || e.key === 'P') {
    if (pause) {
      pause = false;
      draw();
    } else {
      pauseGame();
    }
  }
};
const handleKeyUp = (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
  // spacebar
  else if (e.key === ' ' || e.key === 'Spacebar') {
    spacePressed = false;
  }
};
const handleShipMovement = () => {
  if (rightPressed) {
    if (shipX + 10 > canvas.width - shipWidth) {
      shipX = canvas.width - shipWidth;
    } else {
      shipX += 10;
    }
  } else if (leftPressed) {
    if (shipX - 10 < 0) {
      shipX = 0;
    } else {
      shipX -= 10;
    }
  }
};

// lives and score
let lives = 3;
const drawLives = () => {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Lives: ' + lives, canvas.width - 80, 25);
};
let score = 0;
const drawScore = () => {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 16, 25);
};
const drawPauseText = () => {
  ctx.font = '12px Arial';
  ctx.fillStyle = 'lightpink';
  if (pause) {
    ctx.fillText('PRESS P TO UNPAUSE', 120, 25);
  } else {
    ctx.fillText('PRESS P TO PAUSE', 120, 25);
  }
};

// handle bullet drawing and movement
class Bullet {
  constructor() {
    this.bulletX = shipX + 16;
    this.bulletY = canvas.height - shipHeight - 30;
    this.bulletWidth = 50;
    this.bulletHeight = 50;
    this.active = 1;
  }
  draw() {
    ctx.drawImage(
      bullet,
      this.bulletX,
      this.bulletY,
      this.bulletWidth,
      this.bulletHeight
    );
    this.moveBulletUp();
  }
  moveBulletUp() {
    // this.bulletY -= 4;
    this.bulletY -= 9;
  }
  moveBulletDown() {
    // this.bulletY += 4;
    this.bulletY += 7;
  }
  drawMobBullet() {
    ctx.drawImage(
      bullet,
      this.bulletX,
      this.bulletY,
      this.bulletWidth,
      this.bulletHeight
    );
    this.moveBulletDown();
  }
}
let bullets = [];
const handleBullets = () => {
  if (spacePressed) {
    bullets.push(new Bullet());
    spacePressed = false; // prevents multiple bullets drawn at once
  }
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    if (bullet.active) {
      bullet.draw();
    }
  }
  bulletFrameCounter++;
};

const mobTypes = [mob1, mob2, mob3, mob3];
const mobRows = mobTypes.length;
const mobCols = 12;
const mobWidth = 30;
const mobHeight = 30;
const mobPaddingLeft = 35;
const mobPaddingTop = 20;
const mobOffsetTop = 70;
const mobOffsetLeft = 180;
let mobPosition = 5;
const deathSpriteCooldown = 50;
let mobs = [];
for (let row = 0; row < mobRows; row++) {
  mobs.push([]);
  for (let col = 0; col < mobCols; col++) {
    let mobEntity = {
      type: mobTypes[row],
      x: 0,
      y: 0,
      alive: 1,
      deathFrameCounter: 0,
    };
    mobs[row].push(mobEntity);
  }
}
const drawMobs = () => {
  for (let row = 0; row < mobRows; row++) {
    for (let col = 0; col < mobCols; col++) {
      let currentMob = mobs[row][col];
      let mobX =
        (mobWidth + mobPaddingLeft) * col + mobOffsetLeft + mobPosition;
      let mobY = (mobHeight + mobPaddingTop) * row + mobOffsetTop;
      if (currentMob.alive) {
        currentMob.x = mobX;
        currentMob.y = mobY;

        ctx.drawImage(currentMob.type, mobX, mobY, mobWidth, mobHeight);
      } else {
        if (currentMob.deathFrameCounter < deathSpriteCooldown) {
          ctx.drawImage(mob_destroyed, mobX, mobY, mobWidth, mobHeight);
          currentMob.deathFrameCounter++;
        }
      }
    }
  }
};

// get the x position of the leftmost mob
const getMobLeftEdge = () => {
  for (let col = 0; col < mobCols; col++) {
    for (let row = 0; row < mobRows; row++) {
      const currentMobInCol = mobs[row][col];
      if (currentMobInCol.alive) {
        return currentMobInCol.x;
      }
    }
  }
};
// get the x position of the rightmost mob
const getMobRightEdge = () => {
  let maxX = 0;
  for (let row = 0; row < mobRows; row++) {
    for (let col = 0; col < mobCols; col++) {
      const currentMob = mobs[row][col];
      if (currentMob.alive) {
        if (maxX < currentMob.x) {
          maxX = currentMob.x;
        }
      }
    }
  }
  return maxX;
};
const mobRightBoundary = canvas.width - 50;
const mobLeftBoundary = 20;
let mobMoveCooldown = 30;
let mobMoveFrameCounter = 0;
let mobDirection = 10;
const handleMobPosition = () => {
  if (mobMoveFrameCounter < mobMoveCooldown) {
    mobMoveFrameCounter++;
    return;
  }
  const mobRightEdge = getMobRightEdge();
  const mobLeftEdge = getMobLeftEdge();
  if (mobRightEdge + mobDirection > mobRightBoundary) {
    mobDirection = -mobDirection;
  }
  if (mobLeftEdge + mobDirection < mobLeftBoundary) {
    mobDirection = -mobDirection;
  }
  mobPosition += mobDirection;
  mobMoveFrameCounter = 0;
};

const handleBulletCollision = () => {
  for (const bullet of bullets) {
    for (const mobRow of mobs) {
      for (const mob of mobRow) {
        if (mob.alive && bullet.active) {
          if (
            bullet.bulletX > mob.x - 20 &&
            bullet.bulletX < mob.x + mobWidth - 20 &&
            bullet.bulletY > mob.y &&
            bullet.bulletY < mob.y + mobHeight - 20
          ) {
            bullet.active = 0;
            mob.alive = 0;
            score++;
          }
        }
      }
    }
  }
};

const handleVictory = () => {
  const mobCount = mobs.length * mobs[0].length;
  if (score === mobCount) {
    alert('You Win!');
    pause = true;
    document.location.reload();
  }
};

let mobBullets = [];
// const mobAttackCooldown = 100;
const mobAttackCooldown = 50;
let mobAttackFrameCounter = 0;
const getRandomRow = () => {
  return Math.floor(Math.random() * (mobs.length - 1));
};
const getRandomCol = () => {
  return Math.floor(Math.random() * (mobs[0].length - 1));
};
const handleMobAttack = () => {
  // draw all mob bullets
  for (const attack of mobBullets) {
    if (attack.active) {
      attack.drawMobBullet();
    }
  }
  // prevents another attack from mob until the cooldown is reached
  if (mobAttackFrameCounter < mobAttackCooldown) {
    mobAttackFrameCounter++;
    return;
  }
  // makes a random mob attack
  let validMob = false;
  let mob = null;
  while (!validMob) {
    const randRow = getRandomRow();
    const randCol = getRandomCol();
    mob = mobs[randRow][randCol];
    if (mob.alive) {
      validMob = true;
    }
  }

  let bullet = new Bullet();
  bullet.bulletX = mob.x;
  bullet.bulletY = mob.y + 5;
  bullet.bulletWidth = 20;
  bullet.bulletHeight = 20;
  mobBullets.push(bullet);
  mobAttackFrameCounter = 0;
};

const handleMobBulletCollision = () => {
  for (const bullet of mobBullets) {
    if (bullet.active) {
      if (
        bullet.bulletX > shipX &&
        bullet.bulletX < shipX + shipWidth &&
        bullet.bulletY > canvas.height - shipHeight &&
        bullet.bulletY < canvas.height
      ) {
        bullet.active = 0;
        lives--;
        if (lives === 0) {
          alert('You Lose!');
          pause = true;
          document.location.reload();
        }
      }
    }
  }
};

//     this.bulletX = shipX + 16;
//     this.bulletY = canvas.height - shipHeight - 30;
//     this.bulletWidth = 50;
//     this.bulletHeight = 50;
//     this.active = 1;

const newGame = { x: 485, y: 295, width: 300, height: 80 };
const continueGame = { x: 485, y: 405, width: 300, height: 80 };
const menuOptions = () => {
  ctx.fillStyle = 'white';
  // border
  ctx.fillRect(480, 290, 310, 90);
  ctx.fillRect(480, 400, 310, 90);
  ctx.fillRect(480, 510, 310, 90);
  ctx.fillRect(480, 620, 310, 90);
  // static inner
  ctx.fillStyle = 'black';
  ctx.fillRect(485, 295, 300, 80);
  ctx.fillRect(485, 405, 300, 80);
  ctx.fillRect(485, 515, 300, 80);
  ctx.fillRect(485, 625, 300, 80);
  // text
  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.fillText('new Game', 544, 350);
  ctx.fillText('Continue', 555, 460);

  // hover breaks game...... if you think you can incorporate go ahead.
  // // hover color, inner while mouse moving
  // const menuOpts = [
  //   { x: 485, y: 295, w: 300, h: 80 },
  //   { x: 485, y: 405, w: 300, h: 80 },
  //   { x: 485, y: 515, w: 300, h: 80 },
  //   { x: 485, y: 625, w: 300, h: 80 },
  // ];
  // canvas.onmousemove = function (e) {
  //   var rect = this.getBoundingClientRect();
  //   let x = e.clientX - rect.left;
  //   let y = e.clientY - rect.top;
  //   let i = 0;
  //   let opt;
  //   while ((opt = menuOpts[i++])) {
  //     ctx.beginPath();
  //     ctx.rect(opt.x, opt.y, opt.w, opt.h);
  //     ctx.fillStyle = ctx.isPointInPath(x, y) ? 'rgb(41, 40, 40)' : 'black';
  //     ctx.fill();
  //     // text while moving
  //     ctx.fillStyle = 'white';
  //     ctx.font = '40px Arial';
  //     ctx.fillText('Continue', 555, 460);
  //   }
  // };
};

// Main draw function
draw = () => {
  if (pause) {
    return;
  }

  // Clear the previous frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawScore();
  drawLives();
  drawPauseText();
  drawShip();
  drawStars();
  handleBullets();
  handleShipMovement();
  handleMobPosition();
  handleBulletCollision();
  handleMobBulletCollision();
  drawMobs();
  handleMobAttack();
  handleVictory();

  // Confirm game loop
  console.log('drawing');
  requestAnimationFrame(draw);
};

// test btn to pause game, can be used in menus
const pauseGame = () => {
  // space invaders logo
  pause = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();
  drawScore();
  drawLives();
  const logoWidth = 400;
  const logoHeight = 200;
  const logoX = canvas.width / 2 - logoWidth / 2;
  const logoY = 50;
  ctx.drawImage(game_logo, logoX, logoY, logoWidth, logoHeight);

  // menu
  menuOptions();
  drawPauseText();
};

btn1 = document.getElementById('btn1');
let show = true;
btn1.onclick = () => {
  contain = document.getElementById('container');
  if (show) {
    // contain.style.display = 'none';
    contain.style.display = 'block';
    show = !show;
    pauseGame();
  } else {
    contain.style.display = 'block';
    show = !show;
    pause = false;
    draw();
  }
};

// handle mouse pos for menu options
const getCursorPosition = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
};
const isInside = (pos, rect) => {
  return (
    pos.x > rect.x &&
    pos.x < rect.x + rect.width &&
    pos.y < rect.y + rect.height &&
    pos.y > rect.y
  );
};

const unpauseGame = () => {
  if (pause) {
    pause = false;
    draw();
  }
};

// handle click for menu options
const handleMouseClick = (e) => {
  const mousePos = getCursorPosition(canvas, e);
  if (isInside(mousePos, newGame)) {
    // alert('new Game'); //filler, replace with actual code
    resetGame();
    unpauseGame();
  }
  if (isInside(mousePos, continueGame)) {
    // alert('Continue'); //filler, replace with actual code
    unpauseGame();
  }
  // if (isInside(mousePos, leaderBoards)) {
  //   alert('LeaderBoards'); //filler, replace with actual code
  // }
  // if (isInside(mousePos, settings)) {
  //   alert('Settings'); //filler, replace with actual code
  // }
};

const resetMobs = () => {
  mobs = [];
  for (let row = 0; row < mobRows; row++) {
    mobs.push([]);
    for (let col = 0; col < mobCols; col++) {
      let mobEntity = {
        type: mobTypes[row],
        x: 0,
        y: 0,
        alive: 1,
        deathFrameCounter: 0,
      };
      mobs[row].push(mobEntity);
    }
  }
};

const resetShipPos = () => {
  shipX = canvas.width / 2 - shipWidth;
};

const resetGame = () => {
  score = 0;
  lives = 3;
  resetMobs();
  resetShipPos();
  bullets = [];
  mobBullets = [];
  mobPosition = 0;
};

// Event listeners
document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);
canvas.addEventListener('click', handleMouseClick, false);

// window.onload = draw;
window.onload = pauseGame();
