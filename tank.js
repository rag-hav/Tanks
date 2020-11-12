import {
  Hitbox,
  Base2DObj
} from "./baseClasses.js";
import {
  Point
} from "./utils.js";
import {
  Bullet,
  FollowBullet
} from "./bullet.js";

class Tank extends Base2DObj {
  constructor(i, centreX, centreY, shieldColor) {

    super("tank" + i, centreX, centreY, 100, 60, 100, "tank" + i);
    this.name = "tank" + i;
    this.shieldColor = shieldColor;
    this.i = i;
    this.offsetX = -1 / 3;
    this.offsetY = -1 / 2;
    this.maxHealth = 100;
    this._health = this.maxHealth;
    this.status = "idle";
    this.bullet = FollowBullet;
    this.ammo = 5;
    this.maxAmmo = 5;
    this.reloadTime = 0;
    this.lastReloadTime = 0;
    this.shield = null;
    this.shieldTimeout = null;
    this.shieldRadius = Math.sqrt(this.sizeX ** 2 * 0.45 + this.sizeY ** 2 * 0.25);
    this.angle = Math.random() * Math.PI * 2;
    //this.angle = 0;
    this.drivingForce = 20000;
    this.radialSpeed = Math.PI;
    this.maxRadiusSq = this.sizeX ** 2 * 4 / 9;
    this.startSpeed = Math.min(50, this.drivingForce / (this.mass * this.friction));
    this.updateHitbox();
  }

  updateHitbox() { //Size reducing dropbox calls it
    this.hitbox = new Hitbox(this,
      [
        new Point(-this.sizeX / 3, -this.sizeY / 2),
        new Point(-this.sizeX / 3, this.sizeY / 2),
        new Point(this.sizeX / 3, this.sizeY / 2),
        new Point(this.sizeX / 3, this.sizeY / 8),
        new Point(this.sizeX * 2 / 3, this.sizeY / 8),
        new Point(this.sizeX * 2 / 3, -this.sizeY / 8),
        new Point(this.sizeX / 3, -this.sizeY / 8),
        new Point(this.sizeX / 3, -this.sizeY / 2),
      ]);
  }

  fire() {
    if (this.ammo) {
      canvases.bullets.items.push(new this.bullet(this, this.cx + this.sizeX * Math.cos(this.angle) * 2 / 3, this.cy - this.sizeX * Math.sin(this.angle) * 2 / 3, this.angle));
      this.ammo -= 1;
    }
  }

  set health(newHealth) {
    this._health = newHealth;
    let grayLevel = Math.floor((this.maxHealth - newHealth) / this.maxHealth * 100);
    grayLevel *= (grayLevel >= 0);
    this.canvas.canvas.style.filter = `grayscale(${grayLevel}%)`;
    if (newHealth <= 0) this.status = "dead";
  }

  get health() {
    return this._health;
  }

  frame() {
    //if(this.angle > - Math. PI * 2 && this.i == 0){timeStep =0.01 ;this.fire ();}

    if (this.status) {

      if (this.ammo < this.maxAmmo && time - this.lastReloadTime > this.reloadTime * 1000) {
        this.lastReloadTime = time;
        this.ammo++;
      }

      for (let db of canvases.dropboxes.items)
        if (db.status && this.hitbox.checkCollision(db.hitbox))
          db.effect(this);
      if (this.shield) this.shieldFrame();
    }
    this.move();
    changeQueue.push(this);
  }

  move() {
    if (this.status == "moving") {

      this.applyForce(this.drivingForce * Math.cos(this.angle), -this.drivingForce * Math.sin(this.angle));

    }

    if (this.status == "idle") {
      this.angle -= this.radialSpeed * timeStep;
      if (!this.boundaryCheck()) this.angle += this.radialSpeed * timeStep;
    }

    super.move();
    //this.hitbox.updateTrueCentre();
    this.draw();
  }

  touch(evType) {
    if (evType == "touchstart" || evType == "keydown")
      if (this.status == "idle") {
        this.status = "moving";
        this.radialSpeed *= -1;
        this.fire();
        //this.velocityX = this.startSpeed * Math.cos(this.angle);
        //this.velocityY = -this.startSpeed * Math.sin(this.angle);
      }

    if (evType == "touchend"|| evType == "keyup")
      if (this.status == "moving") {
        this.status = "idle";
      }
  }


  shieldFrame() {
    for (let bullet of canvases.bullets.items) {
      if (bullet.parentTank != this && this.shield.checkCollision(bullet.hitbox))
        bullet.remove();
    }
  }

  _draw() {
    super._draw();
    if (this.shield) this._drawShield();
  }

  _drawShield() {
    this.ctx.fillStyle = this.shieldColor;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.shieldRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
export {
  Tank
};
