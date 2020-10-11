class CanvasWrapper {
  constructor(canvas, width, height) {
    this.height = canvas.height = height;
    this.width = canvas.width = width;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.items = [];
    this.reDraw = false;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let elem of this.items) elem._draw();
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

function distanceBtwPoints(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

function pointInPolygon(p, polygon) {
  let l = polygon.length;
  if (l < 3) return false;
  let result = false;
  for (let i = 0, j = l - 1; i < l; j = i++) {
    let p1 = polygon[i];
    let p2 = polygon[j];

    result ^= ((p.y > p1.y) != (p.y > p2.y) && (p.x - p1.x) <= (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y))
  }
  return result;
}

function drawBackground() {
  let ctx = document.getElementById('background').getContext('2d');
  let imgKey = 'background';
  let imgWidth = 250;
  let imgHeight = 250;
  for (let i = 0; i < HEIGHT / imgHeight; i++)
    for (let j = 0; j < WIDTH / imgWidth; j++)
      ctx.drawImage(images[imgKey], imgWidth * j, imgHeight * i, imgWidth, imgHeight);
}

function principleAngle(a) {
  a = (a % (2 * Math.PI)) + ((a < 0) * 2 * Math.PI);
  return a -= 2 * Math.PI * (a > Math.PI);
}

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth);
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight);
}

var Boundary = [new Point(0, 0), new Point(getWidth(), 0), new Point(getWidth(), getHeight()), new Point(0, getHeight())];

export {
  CanvasWrapper,
  Point,
  distanceBtwPoints,
  pointInPolygon,
  principleAngle,
  getWidth,
  getHeight,
  drawBackground,
  Boundary
};