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

class Goban {
  constructor() {
    //this.hands = new Hands();
    this.inputMode = 1;
    this.stones = (new Array(linesNumber)).fill(undefined).map(() => (new Array(linesNumber)).fill(undefined));
    this.notes = (new Array(linesNumber)).fill(undefined).map(() => (new Array(linesNumber)).fill(''));
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
}

let goban = new Goban();

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
