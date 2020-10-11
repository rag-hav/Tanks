import {
  Point,
  distanceBtwPoints,
  pointInPolygon,
  Boundary
} from "./utils.js";
//import {images, canvases} from "./globals";
let cos = Math.cos,
  sin = Math.sin;

class Base2DObj {
  constructor(imgKey, centreX, centreY, sizeX, sizeY, mass, canvasId = 'background') {
    this._centre = new Point(centreX, centreY);
    this.imgKey = imgKey;
    this.cx = centreX;
    this.cy = centreY;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.offsetX = -0.5;
    this.offsetY = -0.5;
    this.canvas = canvases[canvasId];
    this.ctx = this.canvas.ctx;
    this.status = true;
    this.mass = mass;
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.2;
    changeQueue.push(this);
  }

  get centre() {
    this._centre.x = this.cx;
    this._centre.y = this.cy;
    return this._centre;
  }

  applyForce(forceX, forceY) {
    this.velocityX += forceX / this.mass * timeStep;
    this.velocityY += forceY / this.mass * timeStep;
  }

  remove() {
    this.status = null;
    this.canvas.reDraw = true;
  }

  frame() {}

  move() {
    //friction
    if (this.velocityX != 0) this.velocityX -= Math.min(Math.abs(this.velocityX), Math.abs(this.friction * Math.cos(this.angle) * this.velocityX)) * Math.sign(this.velocityX) * timeStep;

    if (this.velocityY != 0) this.velocityY -= Math.min(Math.abs(this.velocityY), Math.abs(this.friction * Math.sin(this.angle) * this.velocityY)) * Math.sign(this.velocityY) * timeStep;

    let _cx = this.cx,
      _cy = this.cy;

    this.cx += this.velocityX * timeStep;
    if (!this.boundaryCheck()) {
      this.cx = _cx;
      this.velocityX *= -1;
    }

    this.cy += this.velocityY * timeStep;
    if (!this.boundaryCheck()) {
      this.cy = _cy;
      this.velocityY *= -1;
    }
  }

  _draw() {
    if (this.status) {
      this.ctx.save();
      this.ctx.translate(this.cx, this.cy);
      if (this.angle) this.ctx.rotate(-this.angle);
      this.ctx.drawImage(images[this.imgKey], this.sizeX * this.offsetX, this.sizeY * this.offsetY, this.sizeX, this.sizeY);
      this.ctx.restore();
      // if (this.hitbox) this.hitbox._draw();
    }
  }

  draw() {
    this.canvas.reDraw = true;
  }

  boundaryCheck() {
    if (this.hitbox) {
      this.hitbox.updateTrueCentre();
      let c = this.hitbox.trueCentre;
      if (this.hitbox.radius > Math.min(c.x, c.y, WIDTH - c.x, HEIGHT - c.y)) {
        if (!this.hitbox.polygon) return false;
        this.hitbox.updatePosition(true);
        for (let p of this.hitbox.position)
          if (!pointInPolygon(p, Boundary))
            return false;
      }
    }
    return true;
  }

  toString() {
    return this.imgKey + `(${this.cx}, ${this.cy})`;
  }
}

class Hitbox {
  constructor(parent, shape = new Point(0, 0), radius = 1) {
    this.parent = parent;
    if (shape instanceof Array) {

      this.polygon = shape;
      this.calculateSmallestCircle();
      this.positionUpdateTime = 0;
      this.position = [];
      while (this.position.length < shape.length)
        this.position.push(new Point(0, 0));
    } else { //Hitbox is circular or simple
      this.relativeTrueCentre = shape;
      this.polygon = false;
      this.radius = radius;
    }
    this.trueCentre = new Point(0, 0);
    this.updateTrueCentre();
  }

  checkCollision(otherHitbox, firstCall = true) {
    this.updateTrueCentre();
    if (!firstCall || (otherHitbox.radius + this.radius) > distanceBtwPoints(this.trueCentre, otherHitbox.trueCentre)) {
      if (!(otherHitbox.polygon || this.polygon)) return true;

      this.updatePosition();
      otherHitbox.updatePosition();
      if (otherHitbox.polygon && this.polygon) {
        for (let point of otherHitbox.position) {
          if (pointInPolygon(point, this.position))
            return true;
        }
      } else {
        if (otherHitbox.polygon) {
          //console.log("here");
          if (pointInPolygon(this.trueCentre, otherHitbox.position))
            return true;
          for (let point of otherHitbox.position)
            if (distanceBtwPoints(point, this.trueCentre) < this.radius)
              return true;
        }
      }

      return firstCall && otherHitbox.checkCollision(this, false);
    } else return false;
  }

  //the force keyword is used by the move in Base2DObj
  //usually we dont want to repeat update stuff in a frame
  //force of course forces it

  updateTrueCentre(force = false) {
    if (force || this.trueCentreUpdateTime != time) {
      this.trueCentreUpdateTime = time;
      let a = this.parent.angle || 0;
      let p1 = this.relativeTrueCentre;
      let p2 = this.trueCentre;
      p2.x = this.parent.cx + p1.x * cos(a) + p1.y * sin(a);
      p2.y = this.parent.cy - p1.x * sin(a) + p1.y * cos(a);
    }
  }

  updatePosition(force = false) {
    if (force || (this.positionUpdateTime != time && this.polygon)) {
      this.positionUpdateTime = time;
      let a = this.parent.angle || 0;
      for (let i = 0; i < this.polygon.length; i++) {
        let p1 = this.polygon[i];
        let p2 = this.position[i];
        p2.x = this.parent.cx + p1.x * cos(a) + p1.y * sin(a);
        p2.y = this.parent.cy - p1.x * sin(a) + p1.y * cos(a);
      }
    }
  }

  calculateSmallestCircle() {
    let p = this.polygon[0];
    let max = new Point(p.x, p.y);
    let min = new Point(p.x, p.y);

    for (let p of this.polygon) {
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
    }

    let height = max.y - min.y;
    let width = max.x - min.x;
    this.relativeTrueCentre = new Point(min.x + width / 2, min.y + height / 2);
    this.radius = Math.sqrt((width ** 2 + height ** 2)) / 2;
  }

  _draw() {
    this.parent.ctx.lineWidth = 1;
    if (this.polygon) {
      this.parent.ctx.beginPath();
      let lastPoint = this.position[this.position.length - 1];
      this.parent.ctx.moveTo(lastPoint.x, lastPoint.y);
      for (let vertice of this.position)
        this.parent.ctx.lineTo(vertice.x, vertice.y);
      this.parent.ctx.stroke();
    }
    this.parent.ctx.beginPath();
    this.parent.ctx.arc(this.trueCentre.x, this.trueCentre.y, this.radius, 0, Math.PI * 2, true);
    this.parent.ctx.stroke();

    this.parent.ctx.fillStyle = "red";
    this.parent.ctx.beginPath();
    this.parent.ctx.arc(this.trueCentre.x, this.trueCentre.y, 3, 0, Math.PI * 2, true);
    this.parent.ctx.fill();
  }
}

class obstacles extends Base2DObj {
  constructor(centreX, centreY) {
    super("obstacle", centreX, centreY, 100, 100, 100, 'movablesC')

  }
}
export {
  Hitbox,
  Base2DObj
};