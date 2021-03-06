import {
	Hitbox,
	Base2DObj
} from "./baseClasses.js";
import {
	Point,
	principleAngle,
	distanceBtwPoints,
	pointInPolygon
} from "./utils.js";
import {
	Tank
} from "./tank.js";

class Bullet extends Base2DObj {
	constructor(parentTank, centreX, centreY) {
		super("bullet", centreX, centreY, 20, 8, 1, "bullets");
		//this.canvas.items.push(this);
		this.name = "bullet";
		this.firingForce = 20000;
		this.parentTank = parentTank;
		this.angle = parentTank.angle;
		this.damage = 20;
		this.hitbox = new Hitbox(this, new Point(this.sizeX / 2, 0));
		this.alwaysInQueue = true;
		this.velocityX = parentTank.velocityX;
		this.velocityY = parentTank.velocityY;
		this.applyForce(this.firingForce * Math.cos(this.angle), this.firingForce * Math.sin(-this.angle));
		parentTank.applyForce(-this.firingForce * Math.cos(this.angle), -this.firingForce * Math.sin(-this.angle));
	}

	move() {
		this.cx += this.velocityX * timeStep;
		this.cy += this.velocityY * timeStep;
		if (!this.boundaryCheck()) this.remove();
		this.draw();
	}

	collision(obj, firstCall = true) {
		if (obj != this.parentTank && obj instanceof Tank) {
			obj.health -= this.damage;
		}
		this.remove();
		super.collision(obj, firstCall);
	}

	drawPath() {
		let ctx = document.getElementById('background').getContext('2d');
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
		ctx.lineTo(this.cx, this.cy);
		ctx.stroke();
		this.lastPoint = new Point(this.cx, this.cy);
	}
	//_draw(){super. _draw();this. drawPath();}
}

class FollowBullet extends Bullet {
	constructor(...args) {
		super(...args);
		this.name = "follow bullet";
		//this.lastPoint = new Point(this.cx + 1000 * Math. cos(this.angle ), this.cy - Math.sin(this.angle ) * 1000);
		this.lastPoint = new Point(this.cx, this.cy);
		this.turnSpeed = 1;
		this.speed = 350;
		this.damage = 10;
		this.exclusionRadius = this.speed / this.turnSpeed;
		this.exclusionCentres = [new Point(0, 0), new Point(0, 0)];
		this.targetTank = null;
		this.radarRadius = 400;
		this.radarAngle = Math.asin(this.radarRadius / (2 * this.exclusionRadius)) || Math.PI / 2;
	}

	angleChange(tank) {
		let angleDiff = principleAngle(Math.atan2(this.cy - tank.cy, tank.cx - this.cx) - this.angle);
		return Math.min(Math.abs(angleDiff), timeStep * this.turnSpeed) * Math.sign(angleDiff);
	}

	updateExclusionCentres() {
		let a = this.angle + Math.PI / 2;
		let dx = Math.cos(a) * this.exclusionRadius;
		let dy = -Math.sin(a) * this.exclusionRadius;
		this.exclusionCentres[0].x = this.cx + dx;
		this.exclusionCentres[0].y = this.cy + dy;
		this.exclusionCentres[1].x = this.cx - dx;
		this.exclusionCentres[1].y = this.cy - dy;
	}


	pointInExclusionCentres(p) {
		this.updateExclusionCentres();
		for (let centre of this.exclusionCentres)
			if (distanceBtwPoints(p, centre) < this.exclusionRadius)
				return true;
		return false;
	}

	move() {
		if (this.targetTank && this.targetTank.status) {
			let da = this.angleChange(this.targetTank);
			this.angle += da;
			this.velocityX = this.speed * Math.cos(this.angle);
			this.velocityY = this.speed * Math.sin(-this.angle);
			if (!da || this.pointInExclusionCentres(this.targetTank.centre))
				this.targetTank = 0;
		} else if (this.targetTank == null) {
			for (let tank of Tanks)
				if (this.parentTank != tank && tank.status != "dead" && (distanceBtwPoints(tank.centre, this.centre) < this.radarRadius && Math.abs(Math.atan2(this.cy - tank.cy, tank.cx - this.cx) - principleAngle(this.angle)) < this.radarAngle) && !this.pointInExclusionCentres(tank.centre))

					this.targetTank = tank;
		}
		super.move();
	}



	exclusionCentresDraw() {
		this.updateExclusionCentres();
		for (let p of this.exclusionCentres) {
			this.ctx.fillStyle = "#631B1B42";
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, this.exclusionRadius, 0, Math.PI * 2, true);
			//this.ctx.stroke()
			this.ctx.fill();
		}
	}

	radarDraw() {
		this.updateExclusionCentres();
		let p = Math.PI / 2;
		this.ctx.beginPath();
		this.ctx.fillStyle = "#2DFF0030";
		this.ctx.arc(this.exclusionCentres[0].x, this.exclusionCentres[0].y, this.exclusionRadius, -principleAngle(this.angle) + p, -principleAngle(this.angle) + p - this.radarAngle * 2, true);
		this.ctx.arc(this.cx, this.cy, this.radarRadius, -principleAngle(this.angle) - this.radarAngle, -principleAngle(this.angle) + this.radarAngle, false);
		this.ctx.arc(this.exclusionCentres[1].x, this.exclusionCentres[1].y, this.exclusionRadius, -principleAngle(this.angle) - p + this.radarAngle * 2, -principleAngle(this.angle) - p, true);
		this.ctx.stroke();
		this.ctx.fill();
	}
	/*
  _draw(){
    super._draw();
    this.drawPath();
	  // this.exclusionCentresDraw();
	  //this.hitbox._draw();
  this.radarDraw();
  } */
}

export {
	Bullet,
	FollowBullet
};
