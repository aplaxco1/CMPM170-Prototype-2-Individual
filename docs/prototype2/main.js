title = "Color Switch";

description = `Match the colors!
`;

characters = [
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
];

let G = {
  WIDTH: 125,
  HEIGHT: 125,
  OBSTACLE_SIZE: 5,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4,
};

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  seed: 8,
  isPlayingBgm: true,
  theme: "shapeDark"
};

/**
 * @typedef {{
 * pos: Vector,
 * colorIndex: Number
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * speed: Vector
 * colorIndex: Number
 * }} Obstacle
 */

/**
 * @type { Obstacle[] }
 */
let obstacles = [];

/**
 * @type { Color[] }
 */
let colorOptions = ["red", "yellow", "blue", "green"];

let currObstacleSpeed = 0.5;
let obstacleSpawnRate = 0.2;

let obstacleTimer = performance.now();
let increaseSpeedTimer = performance.now();

function update() {
  if (!ticks) {
    resetGame();
  }

  // timed events
  let currTime = performance.now();

  if (currTime - obstacleTimer > 1000) {
    obstacleTimer = currTime;
    if (Math.random() < obstacleSpawnRate) {
      createObstacle();
    }
  }

  if (currTime - increaseSpeedTimer > 5000) {
    increaseSpeedTimer = currTime;
    currObstacleSpeed += 0.01;
    obstacleSpawnRate += 0.04;
    if (obstacleSpawnRate >= 0.9) {
      obstacleSpawnRate = 0.9;
    }
  }

  // switches player color
  if (input.isJustPressed) {
    player.colorIndex++;
    if (player.colorIndex >= colorOptions.length) {
      player.colorIndex = 0;
    }
  }

  // draw player
  color(colorOptions[player.colorIndex]);
  char("a", player.pos);

  // collision detection
  remove(obstacles, (ob) => {
    ob.pos.x += ob.speed.x;
    ob.pos.y += ob.speed.y;

    if (ob.pos.x < -10 || ob.pos.x > G.WIDTH + 10) {
      return true;
    }
    if (ob.pos.y < -10 || ob.pos.y > G.HEIGHT + 10) {
      return true;
    }

    color(colorOptions[ob.colorIndex]);
    box(ob.pos, G.OBSTACLE_SIZE);

    const isColliding = box(ob.pos, G.OBSTACLE_SIZE).isColliding.char.a;

    if (isColliding && ob.colorIndex == player.colorIndex) {
      addScore(10, ob.pos);
      particle(ob.pos, 10, 2);
      play("powerUp");
    } else if (isColliding && ob.colorIndex != player.colorIndex) {
      play("explosion");
      resetGame();
      end();
    }

    return isColliding && ob.colorIndex == player.colorIndex;
  });
}

function createObstacle() {
  let obstacle;
  let dir = randomInt(1, 4);
  if (dir == G.UP) {
    obstacle = {
      pos: vec(G.WIDTH / 2, G.HEIGHT + 10),
      speed: vec(0, -currObstacleSpeed),
      colorIndex: randomInt(0, colorOptions.length),
    };
  } else if (dir == G.RIGHT) {
    obstacle = {
      pos: vec(-10, G.HEIGHT / 2),
      speed: vec(currObstacleSpeed, 0),
      colorIndex: randomInt(0, colorOptions.length),
    };
  } else if (dir == G.LEFT) {
    obstacle = {
      pos: vec(G.WIDTH + 10, G.HEIGHT / 2),
      speed: vec(-currObstacleSpeed, 0),
      colorIndex: randomInt(0, colorOptions.length),
    };
  } else if (dir == G.DOWN) {
    obstacle = {
      pos: vec(G.WIDTH / 2, -10),
      speed: vec(0, currObstacleSpeed),
      colorIndex: randomInt(0, colorOptions.length),
    };
  }
  obstacles.push(obstacle);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * max + min);
}

function resetGame() {
  currObstacleSpeed = 0.5;
  obstacleSpawnRate = 0.25;
  obstacles = [];

  player = { pos: vec(G.WIDTH / 2, G.HEIGHT / 2), colorIndex: 0 };
}
