import {Base2DObj, Hitbox} from "./baseClasses.js";
import {Point} from "./utils.js";

class RectObstacle extends Base2DObj{
  constructor(centreX, centreY){
    super("dropbox", centreX, centreY, 60, 60, 100, 'movables');
    this.hitbox = new Hitbox(this, 
    [
      new Point(-this.sizeX / 2, -this.sizeY / 2),
      new Point(-this.sizeX / 2, this.sizeY / 2),
      new Point(this.sizeX / 2, this.sizeY / 2),
      new Point(this.sizeX / 2, -this.sizeY / 2),
    ] );
    this.draw ();
  }
}

export {RectObstacle} ;