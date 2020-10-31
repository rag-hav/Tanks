import {Hitbox, Base2DObj} from "./baseClasses.js";
import {FollowBullet} from "./bullet.js";
import {Point} from "./utils.js";

class Dropbox extends Base2DObj {
  constructor(centreX, centreY) {
    super("dropbox", centreX, centreY, 30, 30, 50, 'dropboxes');
    this.hitbox = new Hitbox(this, [
      new Point(this.sizeX / 2, this.sizeY / 2), 
      new Point(this.sizeX / 2, -this.sizeY / 2), 
      new Point(-this.sizeX / 2, -this.sizeY / 2), 
      new Point(-this.sizeX / 2, this.sizeY / 2), 
    ])
  }
  effect(){
    this.status = false;
    this.draw();
  }
}

class BulletDropbox extends Dropbox {
  constructor(centreX, centreY, bullet){
    super(centreX, centreY);
    this.bullet = bullet;
  }
  
  effect(tank) {
    super.effect(); 
    let originalBullet = tank.bullet;
    tank.bullet = this.bullet;
    setTimeout(() => {
      tank.bullet = originalBullet;
      this.remove();
    }, 40000);
  } 
}

class FollowBulletDropbox extends BulletDropbox{
  constructor(centreX, centreY){
    super(centreX, centreY, FollowBullet);
  }
} 

class SpeedDropbox extends Dropbox{
  effect(tank){
    super.effect();
    let ratioSize = 0.5;
    let ratioDrivingForce = 2;
    tank.sizeX *= ratioSize;
    tank.sizeY *= ratioSize;
    tank.drivingForce *= ratioDrivingForce;
    tank.updateHitbox();
    
    setTimeout (() => {
      tank.sizeX /= ratioSize;
      tank.sizeY /= ratioSize;
      tank.speed /= ratioSpeed;
      tank.updateHitbox();
      this.remove();
    }, 20000)
  }
}

class ShieldDropbox extends Dropbox{
  //constructor(...args) {super(...args);}
  effect(tank){
    super.effect();
    tank.shield = new Hitbox(tank, new Point(0,0), tank.shieldRadius);
    clearTimeout(tank.shieldTimeout);
    tank.shieldTimeOut = setTimeout(()=>{
      tank.shield = null;
      this.remove();
    }, 10000);
  }
}

class HealthDropbox extends Dropbox{
  effect(tank){
    super.effect();
    tank.health = tank.maxHealth;
  }
}

class InfiniteBulletDropbox extends Dropbox{
  effect(tank){
    super.effect();
    tank.ammo = Infinity;
    clearTimeout(tank.InfiniteAmmoTimeout);
    tank.InfineAmmoTimeOut = setTimeout(() => {
      tank.ammo = tank.maxAmmo;
      this.remove();
    }, 10000);
  }
}

let dropboxes = [FollowBulletDropbox, SpeedDropbox, ShieldDropbox, HealthDropbox, InfiniteBulletDropbox];

function spawnDropbox(){
  let x = Math.random() * WIDTH;
  let y = Math.random() * HEIGHT;
  let i = Math.floor(Math.random() * dropboxes.length);
  i=2;
  let db = new dropboxes[i](x, y) ;
  canvases.dropboxes.items.push(db);
  db.draw();
}

export {spawnDropbox};
