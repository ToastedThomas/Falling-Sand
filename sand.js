
var width = 155;
var height = 70;
var cellSize = 10;
var cvs = document.getElementById('cvs');
cvs.width = width * cellSize;
cvs.height = height * cellSize;
var ctx = cvs.getContext('2d');
var buffer = [];
var EMPTY = 0;
var WALL = 1;
var SAND = 2;
var WATER = 3;
var OIL = 4;
var FIRE = 5;
var colors = {};
colors[EMPTY] = '#999';
colors[WALL] = '#444';
colors[SAND] = '#ff4';
colors[WATER] = '#00f';
colors[OIL] = '#324D25';
colors[FIRE] = '#C52A29';
var selectedItem = SAND;

// set all cells to empty
for (var i = 0; i < width * height; i++)
    buffer[i] = EMPTY;

// set buffer at location (x, y)
function setBuf(x, y, val) {
    buffer[x + y * width] = val;
}

// read buffer at location (x, y)
function getBuf(x, y) {
    if (x < 0 || x >= width ||
        y < 0 || y >= height)
        return EMPTY;
    return buffer[x + y * width];
}

// put some wall (1) down
for (var x = -10; x <= 10; x++)
    setBuf(Math.floor(width / 2) + x, height - 10, WALL);

// put edges on wall
for (var y = height - 10; y > height - 20; y--) {
    setBuf(Math.floor(width / 2) - 10, y, WALL);
    setBuf(Math.floor(width / 2) + 10, y, WALL);
}

document.getElementById('wall').onclick = function() {selectItem(WALL);}
document.getElementById('sand').onclick = function() {selectItem(SAND);}
document.getElementById('water').onclick = function() {selectItem(WATER);}
document.getElementById('void').onclick = function() {selectItem(EMPTY);}
document.getElementById('fire').onclick = function() {selectItem(FIRE);}
document.getElementById('oil').onclick = function() {selectItem(OIL);}

// setting color of buttons with stored color
document.getElementById('wall').style.backgroundColor = colors[WALL];
document.getElementById('sand').style.backgroundColor = colors[SAND];
document.getElementById('water').style.backgroundColor = colors[WATER];
document.getElementById('void').style.backgroundColor = colors[EMPTY];
document.getElementById('oil').style.backgroundColor = colors[OIL];
document.getElementById('fire').style.backgroundColor = colors[FIRE];

function selectItem(item) {
  //make clicked on div the selected element
  selectedItem = item;
  console.log(selectedItem)
}

var emptyOrLiquid = [EMPTY, WATER, OIL];

function think() {
    for (var y = height - 1; y >= 0; y--) {
        var moveHoriz = [];
        for (var x = 0; x < width; x++) {
            // set dir to +1 or -1 randomly
            var dir = Math.random() < 0.5 ? -1 : 1;
            if (getBuf(x, y) == SAND) { // if we have sand
                if (emptyOrLiquid.indexOf(getBuf(x, y + 1)) >= 0) { // if empty/liquid below
                    if (emptyOrLiquid.indexOf(getBuf(x, y + 2)) >= 0) { //if more space to fall
                        if (Math.random() < 0.1 && emptyOrLiquid.indexOf(getBuf(x + dir, y + 1)) >= 0) { //if shifted position is not a wall
                            setBuf(x, y, getBuf(x + dir, y + 1)); // clear sand
                            setBuf(x + dir, y + 1, SAND); // move sand shifted over
                        } else {
                            setBuf(x, y, getBuf(x, y + 1)); // clear sand
                            setBuf(x, y + 1, SAND); // move sand
                        }
                    } else {
                        setBuf(x, y, getBuf(x, y + 1)); // clear sand
                        setBuf(x, y + 1, SAND); // move sand
                    }
                } else if (emptyOrLiquid.indexOf(getBuf(x + dir, y + 1)) >= 0) { // if empty/liquid diagonal
                   if (emptyOrLiquid.indexOf(getBuf(x + dir, y)) >= 0) { // checks for wall in direction of travel, prevents falling through "cracks"
                        setBuf(x, y, getBuf(x + dir, y + 1)); // clear sand
                        setBuf(x + dir, y + 1, SAND); // move sand
                    }
                } 
            } else if (getBuf(x, y) == WATER) { // if we have water
                if (getBuf(x, y + 1) == EMPTY || getBuf(x, y + 1) == OIL) { // if empty below
                    setBuf(x, y, getBuf(x, y + 1)); // clear water
                    setBuf(x, y + 1, WATER); // move water
                } else if (getBuf(x + dir, y) == EMPTY || getBuf(x + dir, y) == OIL) {
                    setBuf(x, y, getBuf(x + dir, y)); // clear water
                    setBuf(x + dir, y, WATER); // move water
                    /*moveHoriz.push({
                            x: x,
                            y: y,
                            nx: x + dir,
                            element: WATER
                        });*/
                }
            } else if (getBuf(x, y) == OIL) { // if we have oil
                if (getBuf(x, y + 1) == EMPTY) { // if empty below
                    setBuf(x, y, EMPTY); // clear oil
                    setBuf(x, y + 1, OIL); // move oil
                } else if (getBuf(x + dir, y) == EMPTY || getBuf(x + dir, y) == WATER) {
                    moveHoriz.push({
                            x: x,
                            y: y,
                            nx: x + dir,
                            element: OIL
                        });
                }
            } else if (getBuf(x, y) == FIRE) { // if we have fire
                if (getBuf(x, y - 1) == OIL) { // if oil is above
                    setBuf(x, y - 1, FIRE); // turn oil to fire
                }
                if (getBuf(x, y + 1) == OIL) {
                    setBuf(x, y + 1, FIRE);
                }
                if (getBuf(x - 1, y) == OIL) { 
                    setBuf(x - 1, y, FIRE);
                }
                if (getBuf(x + 1, y) == OIL) {
                    setBuf(x + 1, y, FIRE);
                }
                setTimeout(fireBurnOut(x, y), 1000);
            }
        }
        for (var i = 0; i < moveHoriz.length; i++) {
            var m = moveHoriz[i];
            if (getBuf(m.x, m.y) == m.element &&
                getBuf(m.nx, m.y) == EMPTY) {
                setBuf(m.x, m.y, EMPTY); // clear element
                setBuf(m.nx, m.y, m.element); // move element
            }
        }
    }
}

function fireBurnOut(x, y) { // turns fire back into empty
    setBuf(x, y, EMPTY);
}

function draw() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            ctx.fillStyle = colors[getBuf(x, y)];
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

let placingInterval;
let cursorX;
let cursorY;
let marginVal = parseInt(getComputedStyle(cvs).getPropertyValue('margin-left'));
document.getElementById('elementHolder').style.marginLeft = marginVal + 'px';
console.log(marginVal/10)

cvs.onmousemove = function(event) {
  //tracking mouse location for placing
  cursorX = event.clientX;
  cursorY = event.clientY;
}
cvs.onmousedown = function(event) {
  //setting the rate at how fast elements are placed
  placingInterval = setInterval(placing, 20, event);
}
cvs.touchmove = function(event) {
    //tracking finger location for mobile placing
    cursorX = event.clientX;
    cursorY = event.clientY;
}
cvs.touchstart = function(event) {
    //setting the rate at how fast elements are placed
    placingInterval = setInterval(placing, 20, event);
}
function placing(event) {
  marginVal = parseInt(getComputedStyle(cvs).getPropertyValue('margin-left'));
  setBuf((Math.floor(cursorX/10) - 1 - Math.floor(marginVal/10)) /* + (Math.floor(Math.random() * 3) - 1)*/, Math.floor(cursorY/10) - 1, selectedItem);
  //console.log(Math.floor(cursorX/10) - 1)
  //console.log(Math.floor(cursorY/10) - 1)
}
cvs.onmouseup = function() {
  //turns off the placing loop
  clearInterval(placingInterval);
  placingInterval = null;
}
cvs.onmouseleave = function() {
  //also turns off the placing loop
  clearInterval(placingInterval);
  placingInterval = null;
}
cvs.touchend = function() {
    //turns off the placing loop for mobile
    clearInterval(placingInterval);
    placingInterval = null;
}
cvs.touchcancel = function() {
    //also turns off the placing loop for mobile
    clearInterval(placingInterval);
    placingInterval = null;
  }

function tick() {
    think();
    draw();
}

// draw a frame every 0.01 second
setInterval(tick, 10);