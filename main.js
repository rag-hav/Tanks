import {CanvasWrapper, getHeight, getWidth} from "./utils.js";
import {Tank} from "./tank.js";
import {spawnDropbox} from "./dropbox.js";

window.items = {};
window.images = {};
window.canvases = {};
window.timeStep = 0;
window.time = 0;
window.HEIGHT = getHeight();
window.WIDTH = getWidth(); 
window.changeQueue = [];

document.addEventListener("touchstart", touchHandler, false);
document.addEventListener("touchend", touchHandler, false);

for (let c of document.getElementsByTagName("canvas")) {
  canvases[c.id] = new CanvasWrapper(c, WIDTH, HEIGHT);
}

items.tanks = [new Tank(0, WIDTH / 2, 50),
new Tank(1, WIDTH / 2, HEIGHT - 50)];
items.bullets = [];
items.dropboxes = [];

function touchHandler(ev) {
  let i = Number(ev.changedTouches[0].pageY > HEIGHT / 2);
  items.tanks[i].touch(ev.type);
}

function initializeImages(resolve, reject) {
  let counter = 0;
  let images_ = ["tank0", "tank1", "bullet", "dropbox"];
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
  let lastSpawnTime = 0;
  let lastTime = null;

  function frame(time) {
    if(time - lastSpawnTime > 2000){
      spawnDropbox();
      lastSpawnTime = time;
    }
    window.time = time;
    if (lastTime) {
      timeStep = Math.min((time - lastTime), 100) / 1000;
      changeQueue.push(...[...items.tanks, ...items.bullets]);

      let length_ = changeQueue.length;
      for (let i = 0; i < length_; i++)
        changeQueue.shift().frame();

      for (let group in items) {
        items[group] = items[group].filter((obj) => {return obj.status != null});
        //let i=-1;
        //while(items[group][++i] && !items[group][i].status);
        //items[group] = items[group].slice(i) ;
      }
      
      canvases.bulletsC.items = items.bullets;
      canvases.dropboxesC.items = items.dropboxes;

      for (let canvasId in canvases) {
        let c = canvases[canvasId];
        if (c.reDraw) c.draw();
        c.reDraw = false;
      }
    }
    lastTime = time;
    window.animation = requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.play = startAnimation;
window.pause = () => setTimeout("cancelAnimationFrame(animation)", 0);
window.nextFrame = ()=>{play(); pause()}

window.init = function (){
  let imgPromise = new Promise(initializeImages);
  imgPromise.then(startAnimation);
}