// strict mode
"use strict";

let canvas = document.getElementById('goban');
let context = canvas.getContext('2d');
let retinaScale = 4.0;
let cellLength = 40;
let linesNumber = 19;
let stoneSemidiameter = cellLength / 2 - 0.5;

canvas.width = cellLength * linesNumber * retinaScale;
canvas.height = cellLength * linesNumber * retinaScale;
context.scale(retinaScale, retinaScale);
canvas.style.width = cellLength * linesNumber + 'px';
canvas.style.height = cellLength * linesNumber + 'px';

let xyval = [];
for (let i = 0; i < linesNumber; ++i) {
  xyval.push(cellLength / 2 * (i * 2 + 1))
}

console.log(xyval)

class Stone {
  constructor(xIndex, yIndex, color, status = 'placed') {
    this.xIndex = xIndex;
    this.yIndex = yIndex;
    this.color = color;
    this.status = status;  // 'placed', 'preview', 'notplaced', 'removed'
  }
}

/*
* stones[yIndex][xIndex]: null or stone.status: 'placed'
stonePreview: null
* notes: all null
*/
class Goban {
  constructor() {
    //this.hands = new Hands();
    this.inputMode = 1;
    this.stones = (new Array(linesNumber)).fill(null).map(() => (new Array(linesNumber)).fill(null));
    this.stonePreview = null;
    this.notes = (new Array(linesNumber)).fill(null).map(() => (new Array(linesNumber)).fill(null));
    this.initializeBoard();
  }

  initializeBoard() {
    context.clearRect(0, 0, canvas.width / retinaScale, canvas.height / retinaScale);
    context.beginPath();
    for (let [i, val] of xyval.entries()) {
      context.moveTo(val, xyval[0]);
      context.lineTo(val, xyval[linesNumber - 1]);
      context.moveTo(xyval[0], val);
      context.lineTo(xyval[linesNumber - 1], val);
    }
    context.stroke();

    let starXyIndex = [3, 9, 15];
    context.fillStyle = 'black';
    for (let xIndex of starXyIndex) {
      let x = cellLength / 2 * (xIndex * 2 + 1);
      for (let yIndex of starXyIndex) {
        let y = cellLength / 2 * (yIndex * 2 + 1);
        context.beginPath();
        context.arc(x, y, 3.0, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  drawStone(stone) {
    let x = cellLength / 2 * (stone.xIndex * 2 + 1);
    let y = cellLength / 2 * (stone.yIndex * 2 + 1);
    context.save();
    context.fillStyle = stone.color;
    context.beginPath();
    context.arc(x, y, stoneSemidiameter, 0, Math.PI * 2);
    context.fill();
    context.restore();
    if (stone.color == 'white') {
      context.beginPath();
      context.arc(x, y, stoneSemidiameter, 0, Math.PI * 2);
      context.stroke();
    }
  }

  updateBoard() {
    this.initializeBoard();
    for (let yIndex = 0; yIndex < linesNumber; ++yIndex) {
      for (let xIndex = 0; xIndex < linesNumber; ++xIndex) {
        if (this.stones[yIndex][xIndex] !== null) {
          this.drawStone(this.stones[yIndex][xIndex]);
        }
      }
    }
  }

  addStone(stone) {
    console.assert(stone.status == 'placed' || stone.status == 'preview', 'stone.status is unexpected: ' + stone.status);
    if (stone.status == 'placed') {
      this.stones[stone.yIndex][stone.xIndex] = stone;
    }
    this.updateBoard();
  }

  addStonePreview(stone) {
    console.assert(stone.status == 'preview', "stone.status must be 'preview'");
    this.stonePreview = stone;
  }
}

let goban = new Goban();
goban.addStone(new Stone(0, 0, 'white'));
goban.addStone(new Stone(1, 0, 'black'));

function putStone(xIndex, yIndex, color) {
  let x = cellLength / 2 * (xIndex * 2 + 1);
  let y = cellLength / 2 * (yIndex * 2 + 1);
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, stoneSemidiameter, 0, Math.PI * 2);
  context.fill();
  if (color == 'white') {
    context.beginPath();
    context.arc(x, y, stoneSemidiameter, 0, Math.PI * 2);
    context.stroke();
  }
}

putStone(0, 0, 'white');
putStone(1, 0, 'black');
