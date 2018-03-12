const WIDTH = 500;
const HEIGHT = 450;
const ants = [];
let surface = null;
let start, end;
const GOAL_RADIUS = 20;
const NUM_ANTS = 300;
const TOUCH_TIMER = 70;
const UNFREEZE_TIMER = 30;
const SPEED = 4;
const TURN_SPEED = 0.5;
const JIGGLE_SPEED = 0.2;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  
  surface = [
    createVector(-100, 600),
    createVector(-50, 650),
    createVector(250, 100),
    createVector(450, 450),
    createVector(500, 420),
    createVector(250, 0),
  ];
  start = createVector(35, 420);
  end = createVector(465, 420);
  
  for (let i = 0; i < NUM_ANTS; i++) {
    const x = random(-75, 200);
    ants.push({
      frozen: false,
      timer: 0,
      speed: SPEED,
      position: createVector(
        x,
        120 + 300 * (1 - (x - 35) / (200 - 35))
      ),
      target: end,
      angle: random(0, -Math.PI/2),
      above: new Set(),
      below: new Set(),
    });
  }
}

function tryStep(ant, nextPosition) {
  const onSurface = collidePointPoly(nextPosition.x, nextPosition.y, surface);
  [...ant.below].forEach(a => {
    a.above.delete(ant);
  });
  ant.below.clear();

  if (onSurface) {
    ant.position = nextPosition;
    return true;
  } else {
    const antCollisions = ants.filter(a => a != ant && a.frozen &&
                                      nextPosition.copy().sub(a.position).mag() < 10);
    if (antCollisions.length > 0) {
      antCollisions.forEach(a => {
        a.above.add(ant);
        ant.below.add(a);
      });
      ant.position = nextPosition;
      return true;
    } else {
      return false;
    }
  }
}

function draw() {
  ants.forEach(ant => {
    if (ant.position.copy().sub(ant.target).mag() < GOAL_RADIUS + 10) {
      ant.target = (ant.target == end) ? start : end;
      ant.angle = random(0, Math.PI);
    }
    ant.angle += random(-1, 1)*JIGGLE_SPEED;
    
    if (ant.timer > 0) ant.timer--;
    if (!ant.frozen) {
      const toTarget = ant.target.copy().sub(ant.angle).normalize();
      const antAngle = createVector(Math.cos(ant.angle), Math.sin(ant.angle)).normalize();
      const closerToTarget = antAngle.copy().mult(0.7)
        .add(toTarget.copy().mult(0.3));
      if (tryStep(ant, ant.position.copy().add(
        antAngle.mult(ant.speed)))) {
      } else if (tryStep(ant, ant.position.copy().add(
        closerToTarget.mult(ant.speed)))) {
        ant.angle = closerToTarget.heading();
      } else if (tryStep(ant, ant.position.copy().add(
        antAngle.copy().mult(ant.speed)))) {
        
      } else if (ant.timer === 0) {
        ant.timer = TOUCH_TIMER;
        ant.frozen = true;
        ants.filter(a => a != ant && a.frozen &&
                    ant.position.copy().sub(a.position).mag() < 10).forEach(a => {
          a.above.add(ant);
          ant.below.add(a);
        });
      } else {
        ant.angle -= TURN_SPEED * (Math.random(-1, 1));
      }
    }
  });
  
  ants.forEach(ant => {
    if (ant.frozen) {
      if (ant.above.size > 0) {
        ant.timer = TOUCH_TIMER;
      } else if (ant.timer === 0) {
        ant.frozen = false;
        ant.timer = UNFREEZE_TIMER;
      }
    }
  });
  
  noStroke();
  fill('#88AADD');
  rect(0, 0, WIDTH, HEIGHT);
  
  fill('#FFFFFF');
  beginShape();
  surface.forEach(v => vertex(v.x, v.y));
  endShape(CLOSE);
  
  fill('rgba(255, 0, 0, 0.5)');
  [start, end].forEach(v => ellipse(v.x, v.y, 2*GOAL_RADIUS, 2*GOAL_RADIUS));
  
  ants.forEach(ant => {
    if (ant.target == end) {
      fill('#555555');
      stroke('#222222');
    } else {
      fill('#AA3333');
      stroke('#881111');
    }
    translate(ant.position.x, ant.position.y);
    rotate(ant.angle);
    ellipse(0, 0, 20, 10);
    resetMatrix();
    stroke('#FF0000');
    /*[...ant.above].forEach(a => {
      line(ant.position.x, ant.position.y, a.position.x, a.position.y);
    })*/
  });
}