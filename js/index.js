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
const JITTER_SPEED = 0.2;
const ANT_RADIUS = 10;

class Ant {
  // State
  constructor(target) {
    const x = random(-75, 200);
    this.position =  createVector(
      x,
      120 + 300 * (1 - (x - 35) / (200 - 35))
    );

    this.target = target;
    this.speed = SPEED;
    this.angle = random(0, -Math.PI/2);
    this.above = new Set();
    this.below = new Set();
    this.frozen = false;
    this.timer = 0;
  }

  isFrozen() {
    return this.frozen;
  }

  // Removes the ant from the ants below it
  pickUp() {
    [...this.below].forEach(a => a.above.delete(this));
    this.below.clear();
  }

  // Places the ant on top of some other ants
  placeOn(antsBelow) {
    antsBelow.forEach(a => a.above.add(this));
    antsBelow.forEach(a => this.below.add(a));
  }

  isSteppedOn(location) {
    return this.isFrozen() && location.copy().sub(this.position).mag() < ANT_RADIUS;
  }

  computeAntsBelow(location) {
    return ants.filter(a => a != this && a.isSteppedOn(location));
  }

  // Move to a position if possible
  tryStep(nextPosition) {
    // Check if the target position is a walkable surface
    if (collidePointPoly(nextPosition.x, nextPosition.y, surface)) {
      this.position = nextPosition;
      return true;
    }

    // Check if the target position is on top of an ant bridge
    const antsBelow = this.computeAntsBelow(nextPosition);
    if (antsBelow.length > 0) {
      this.placeOn(antsBelow);
      this.position = nextPosition;
      return true;
    }

    // Otherwise, we weren't able to step to the position
    return false;
  }

  onGoal() {
    return this.position.copy().sub(this.target).mag() < GOAL_RADIUS + 10
  }

  swapGoal() {
    this.target = (this.target == end) ? start : end;
    this.angle = random(0, Math.PI);
  }

  jitter() {
    this.angle += random(-1, 1)*JITTER_SPEED;
  }

  tick() {
    if (this.onGoal()) {
      this.swapGoal();
    }

    this.jitter();

    if (this.timer > 0) this.timer--;
    if (!this.frozen) {
      this.pickUp();

      const toTarget = this.target.copy().sub(this.angle).normalize();
      const antAngle = createVector(Math.cos(this.angle), Math.sin(this.angle)).normalize();
      const closerToTarget = antAngle.copy().mult(0.7)
        .add(toTarget.copy().mult(0.3));

      // Try to step directly forwards at the current heading
      if (this.tryStep(this.position.copy().add(
        antAngle.mult(this.speed)))) {

      // Try to point a bit closer to the target and step
      } else if (this.tryStep(this.position.copy().add(
        closerToTarget.mult(this.speed)))) {
        // Adjust our angle if this was successful
        this.angle = closerToTarget.heading();

      } else if (this.timer === 0) {
        this.timer = TOUCH_TIMER;
        this.frozen = true;
        this.placeOn(this.computeAntsBelow(this.position));
      } else {
        this.angle -= TURN_SPEED * (Math.random(-1, 1));
      }
    } else {
      if (this.above.size > 0) {
        this.timer = TOUCH_TIMER;
      } else if (this.timer === 0) {
        this.frozen = false;
        this.timer = UNFREEZE_TIMER;
      }
    }
  }
}

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
    ants.push(new Ant(end));
  }
}



function draw() {
  ants.forEach(ant => ant.tick());

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
  });
}
