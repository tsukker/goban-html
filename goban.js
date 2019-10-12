// strict mode
"use strict";

let canvas = document.getElementById('goban');
canvas.onselectstart = function () { return false; }  // https://stackoverflow.com/questions/3684285/how-to-prevent-text-select-outside-html5-canvas-on-double-click
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

class Hand {
  constructor(placedStone, removedStones) {
    this.placedStone = placedStone;
    this.removedStones = removedStones;
    this.status = null;  // 'evaluated', 'preview', 'unevaluated'
  }
}

/*
* stones[yIndex][xIndex]: null or stone.status: 'placed'
* stonePreview: not null only on empty cell
* notes: all null
*/
class Goban {
  constructor() {
    //this.hands = new Hands();
    this.inputMode = 1;
    this.setNextColor('black');
    this.stones = (new Array(linesNumber)).fill(null).map(() => (new Array(linesNumber)).fill(null));
    this.stonePreview = null;
    this.notes = (new Array(linesNumber)).fill(null).map(() => (new Array(linesNumber)).fill(''));
    this.pointNoteBeEntered = { xIndex: 0, yIndex: 0 };
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

  setNextColor(color) {
    console.assert(color === 'black' || color === 'white');
    this.nextColor = color;
    var stoneEmoji = '';
    var backgroundColor = '';
    if (color === 'black') {
      backgroundColor = 'black';
    } else if (color === 'white') {
      backgroundColor = 'white';
    } else {
      console.assert(false, "`color` must be either 'black' or 'white'");
    }
    document.getElementById('next-stone-color').style.background = backgroundColor;
  }

  switchNextColor() {
    if (this.nextColor === 'black') {
      this.setNextColor('white');
    } else if (this.nextColor === 'white') {
      this.setNextColor('black');
    } else {
      console.assert(false);
    }
  }

  drawStone(stone) {
    let x = cellLength / 2 * (stone.xIndex * 2 + 1);
    let y = cellLength / 2 * (stone.yIndex * 2 + 1);
    context.save();
    if (stone.status === 'placed') {
      context.fillStyle = stone.color;
    } else if (stone.status === 'preview') {
      context.fillStyle = `rgba(0, 0, 0, ${stone.color === 'black' ? 0.4 : 0.1})`;
    } else {
      assert(false);
    }
    context.beginPath();
    context.arc(x, y, stoneSemidiameter, 0, Math.PI * 2);
    context.fill();
    context.restore();
    if (stone.status === 'placed' && stone.color === 'white') {
      context.beginPath();
      context.arc(x, y, stoneSemidiameter - 0.5, 0, Math.PI * 2);
      context.stroke();
    }
  }

  drawNote(note, xIndex, yIndex) {
    let x = cellLength / 2 * (xIndex * 2 + 1);
    let y = cellLength / 2 * (yIndex * 2 + 1);
    context.save();
    let fontSize = [-1, 27, 23, 19][note.length];
    context.font = fontSize.toString() + 'px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    if (this.stones[yIndex][xIndex] !== null) {
      let bgStone = this.stones[yIndex][xIndex];
      if (bgStone.status === 'placed') {
        if (bgStone.color === 'black') {
          context.fillStyle = 'white';
        }
      }
    } else {
      context.clearRect(x - cellLength / 2, y - cellLength / 2, cellLength, cellLength);
    }
    context.fillText(note, x, y);
    context.restore();
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
    for (let yIndex = 0; yIndex < linesNumber; ++yIndex) {
      for (let xIndex = 0; xIndex < linesNumber; ++xIndex) {
        if (this.notes[yIndex][xIndex] !== null && this.notes[yIndex][xIndex].length > 0) {
          this.drawNote(this.notes[yIndex][xIndex], xIndex, yIndex);
        }
      }
    }
    if (this.stonePreview !== null) {
      let yIndex = this.stonePreview.yIndex;
      let xIndex = this.stonePreview.xIndex;
      if (this.stones[yIndex][xIndex] === null) {
        this.drawStone(this.stonePreview);
      }
    }
  }

  addStone(stone) {
    console.assert(stone.status === 'placed', "stone.status must be 'placed'");
    if (stone.status == 'placed') {
      this.stones[stone.yIndex][stone.xIndex] = stone;
    }
    this.updateBoard();
  }

  removeStone(xIndex, yIndex) {
    this.stones[yIndex][xIndex] = null;
    this.updateBoard();
  }

  addStonePreview(stone) {
    console.assert(stone.status === 'preview', "stone.status must be 'preview'");
    this.stonePreview = stone;
    this.updateBoard();
  }

  clearStonePreview() {
    this.stonePreview = null;
    this.updateBoard();
  }

  isValidNote(note) {
    if (note.length > 3) {
      return false;
    }
    if (note.length == 1) {
      return true;
    }
    return RegExp(/^[0-9]*$/).test(note);
  }

  setNote(note, x, y) {
    if (this.isValidNote(note)) {
      this.notes[y][x] = note;
    }
    this.updateBoard();
  }

  getClosestPointIfMouseIsOn(e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;  // e.layerX;
    let y = e.clientY - rect.top;  // e.layerY;
    let ret = { mouseIsOn: true, xIndex: 0, x: xyval[0], yIndex: 0, y: xyval[0] };
    for (let [i, val] of xyval.entries()) {
      if (Math.abs(x - val) < Math.abs(x - ret.x)) {
        ret.xIndex = i;
        ret.x = val;
      }
      if (Math.abs(y - val) < Math.abs(y - ret.y)) {
        ret.yIndex = i;
        ret.y = val;
      }
    }
    if (Math.hypot(ret.x - x, ret.y - y) > stoneSemidiameter) {
      ret.mouseIsOn = false;
    }
    return ret;
  }

  getInputMode() {
    return document.getElementById('input-mode-form')['input-mode'].value;
  }

  onMouseMove(e) {
    let closest = this.getClosestPointIfMouseIsOn(e);
    if (!closest.mouseIsOn) {
      this.clearStonePreview();
      return;
    }
    if (this.stones[closest.yIndex][closest.xIndex] === null) {
      this.addStonePreview(new Stone(closest.xIndex, closest.yIndex, this.nextColor, 'preview'));
    }
  }

  onMouseOut(e) {
    this.clearStonePreview();
  }

  onMouseUp(e) {
    console.log(e);
    let closest = this.getClosestPointIfMouseIsOn(e);
    if (!closest.mouseIsOn) {
      return;
    }
    if (this.getInputMode() === 'text') {
      return;
    }
    console.assert(this.getInputMode() === 'normal');
    if (this.stones[closest.yIndex][closest.xIndex] === null) {
      this.addStone(new Stone(closest.xIndex, closest.yIndex, this.nextColor, 'placed'));
      this.switchNextColor();
    }
  }

  onDoubleClick(e) {
    let closest = this.getClosestPointIfMouseIsOn(e);
    if (!closest.mouseIsOn) {
      return;
    }
    if (this.getInputMode() === 'text') {
      // show text-input mordal.
      document.getElementById('stone-note-input').classList.add('is-open')
      document.getElementById('mordal-background').classList.add('is-open')

      // save xIndex and yIndex in order that entered text is applied to the corresponding point.
      this.pointNoteBeEntered.xIndex = closest.xIndex;
      this.pointNoteBeEntered.yIndex = closest.yIndex;

      // set the current `this.notes[yIndex][xIndex]` to the text input.
      let noteInput = document.getElementById('stone-note-input');
      noteInput.value = this.notes[closest.yIndex][closest.xIndex];

      // focus and select all.
      /* NOTE:
       * `document.activeElement` doesn't change even after `focus()` and `select()` without `setTimeout`.
       * This seems to be occurred because this method `onDoubleClick` is called by the event listener.
       * Also, if the timeout value is small enough (10, for instance), then `document.activeElement` may not change.
       */
      setTimeout(function () {
        //console.log(noteInput);
        noteInput.focus();
        //console.log(document.activeElement);
        noteInput.select();
        //console.log(document.activeElement);
      }, 40);

      return;
    }
    console.assert(this.getInputMode() === 'normal');
    if (this.stones[closest.yIndex][closest.xIndex] !== null) {
      this.removeStone(closest.xIndex, closest.yIndex);
    }
  }

  enterNote(e) {
    console.log(e);
    // stop the process of `submit` and prevent the page from being reloaded.
    e.stopPropagation();
    e.preventDefault();

    // hide input-text mordal.
    document.getElementById('stone-note-input').classList.remove('is-open')
    document.getElementById('mordal-background').classList.remove('is-open')

    let xIndex = this.pointNoteBeEntered.xIndex;
    let yIndex = this.pointNoteBeEntered.yIndex;
    this.setNote(document.getElementById('stone-note-input').value, xIndex, yIndex);
  }
}

let goban = new Goban();
canvas.addEventListener('mousemove', e => { goban.onMouseMove(e); }, false);
canvas.addEventListener('mouseout', e => { goban.onMouseOut(e); }, false);
canvas.addEventListener('mouseup', e => { goban.onMouseUp(e); }, false);
canvas.addEventListener('dblclick', e => { goban.onDoubleClick(e); }, false);

let noteForm = document.getElementById('stone-note-form');
noteForm.addEventListener('submit', e => { goban.enterNote(e); });

let switchColorButton = document.getElementById('switch-color-button');
switchColorButton.addEventListener('click', e => { goban.switchNextColor(); }, false);

let test = function () {
  goban.addStone(new Stone(0, 0, 'white'));
  goban.addStone(new Stone(1, 0, 'white'));
  goban.addStone(new Stone(2, 0, 'white'));
  goban.addStone(new Stone(0, 1, 'black'));
  goban.addStone(new Stone(1, 1, 'black'));
  goban.addStone(new Stone(2, 1, 'black'));
  goban.setNote('7', 0, 0);
  goban.setNote('77', 1, 0);
  goban.setNote('777', 2, 0);
  goban.setNote('7', 0, 1);
  goban.setNote('77', 1, 1);
  goban.setNote('777', 2, 1);
  goban.setNote('C', 2, 2);
  goban.setNote('D', 3, 2);
};

