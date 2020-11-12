import {
  CanvasWrapper,
  drawBackground,
  getHeight,
  getWidth
} from "./utils.js";
import {
  Tank
} from "./tank.js";
import {
  spawnDropbox
} from "./dropbox.js";
import {
  RectObstacle
} from "./obstacles.js";

window.items = {};
window.images = {};
window.canvases = {};
window.timeStep = 0;
window.time = 0;
window.HEIGHT = getHeight();
window.WIDTH = getWidth();
window.changeQueue = [];
window.Tanks = [];


document.addEventListener("touchstart", touchHandler, false);
document.addEventListener("touchend", touchHandler, false);
document.addEventListener("keyup", keyHandler, false);
document.addEventListener("keydown", keyHandler, false);

for (let c of document.getElementsByTagName("canvas")) {
  canvases[c.id] = new CanvasWrapper(c, WIDTH, HEIGHT);
}


Tanks = [new Tank(0, WIDTH / 2, 100, "#00BBFF30"), new Tank(1, WIDTH / 2, HEIGHT - 100, "#FF000030")];
for (let i = 0; i < 2; i++)
  canvases["tank" + i].items.push(Tanks[i]);
canvases.bullets.items = [];
canvases.dropboxes.items = [];
canvases.movables.items = [new RectObstacle(WIDTH / 2, HEIGHT / 2)];


function touchHandler(ev) {
  let i = Number(ev.changedTouches[0].pageY > HEIGHT / 2);
  canvases["tank" + i].items[0].touch(ev.type);
}
function keyHandler(ev) {
	ev = ev || window.event;
	if(canvases["tank" + (ev.key - 1)]){
	  canvases["tank" + (ev.key - 1)].items[0].touch(ev.type);
  }
}

function initializeImages(resolve, reject) {
  let counter = 0;
  let images_ = ["tank0", "tank1", "bullet", "dropbox", "background"];
  for (let i of images_) {
    let img = new Image();
    img.onload = () => {
      counter++;
      if (counter == images_.length) resolve()
    };
    img.src = "assets/" + i + ".png";
    images[i] = img;
  }
}


function startAnimation() {
  drawBackground();
  let lastSpawnTime = 0;
  let lastTime = null;

  function frame(time) {
    if (time - lastSpawnTime > 1500) {
      //spawnDropbox();
      lastSpawnTime = time;
    }
    window.time = time;
    if (lastTime) {
      timeStep = Math.min((time - lastTime), 100) / 1000;
      let length_ = changeQueue.length;
      for (let i = 0; i < length_; i++)
        changeQueue.shift().frame();

      var collideables = [...canvases.movables.items, ...canvases.dropboxes.items, ...Tanks];
      for (let i = 0; i < collideables.length; i++) {
        for (let j = i + 1; j < collideables.length; j++) {

          if (collideables[i].hitbox.checkCollision(collideables[j].hitbox)) {
            collideables[i].collision(collideables[j]);
          } 
        }
      }
      for (let canvasId in canvases) {
        let canvas = canvases[canvasId];
        canvas.items = canvas.items.filter((obj) => {
          return obj.status != null
        });
        if (canvas.reDraw) canvas.draw();
        canvas.reDraw = false;
      }
    }
    lastTime = time;
    window.animation = requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.play = startAnimation;
window.pause = () => setTimeout("cancelAnimationFrame(animation)", 0);
window.nextFrame = () => {
  play();
  pause()
}

window.init = function() {
  let imgPromise = new Promise(initializeImages);
  imgPromise.then(startAnimation);
}
