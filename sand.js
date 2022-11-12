
var width = 155;
var height = 70;
var cellSize = 10;
var cvs = document.getElementById('cvs');
cvs.width = width * cellSize;
cvs.height = height * cellSize;
var ctx = cvs.getContext('2d');
//info for canvas above

var buffer = [];

let EMPTY = {
    id: 0,
    color: '#999999',
    isSolid: false,
    btn: document.getElementById('void'),
    desc: 'Empty, nothing, eraser.',
    name: 'Void'
}
let WALL = {
    id: 1,
    color: '#444444',
    isSolid: true,
    btn: document.getElementById('wall'),
    desc: 'Walls prevent things from moving. Walls are not effected by gravity.',
    name: 'Wall'
}
let SAND = {
    id: 2,
    color: '#ffff44',
    isSolid: true,
    btn: document.getElementById('sand'),
    desc: 'Sand particles scatter when falling.',
    name: 'Sand'
}
let WATER = {
    id: 3,
    color: '#0000ff',
    isSolid: false,
    btn: document.getElementById('water'),
    desc: 'Water does not mix with oil. Water can be evaporated with fire.',
    name: 'Water'
}
let OIL = {
    id: 4,
    color: '#324D25',
    isSolid: false,
    btn: document.getElementById('oil'),
    desc: 'Oil does not mix with water. Oil can also be ignited.',
    name: 'Oil'
}
let FIRE = {
    id: 5,
    color: '#C52A29',
    isSolid: false,
    btn: document.getElementById('fire'),
    desc: 'Fire can ignite oil. Fire also evaporates water.',
    name: 'Fire'
}
let Elements = [EMPTY, WALL, SAND, WATER, OIL, FIRE];

var selectedItem = SAND.id;

// set all cells to empty
for (var i = 0; i < width * height; i++)
    buffer[i] = EMPTY.id;

// set buffer at location (x, y)
function setBuf(x, y, val) {
    buffer[x + y * width] = val;
}

// read buffer at location (x, y)
function getBuf(x, y) {
    if (x < 0 || x >= width ||
        y < 0 || y >= height)
        return EMPTY.id;
    return buffer[x + y * width]
}

// put some wall (1) down
for (var x = -10; x <= 10; x++)
    setBuf(Math.floor(width / 2) + x, height - 10, WALL.id);

// put edges on wall
for (var y = height - 10; y > height - 20; y--) {
    setBuf(Math.floor(width / 2) - 10, y, WALL.id);
    setBuf(Math.floor(width / 2) + 10, y, WALL.id);
}

Elements.forEach(element => element.btn.onclick = function() {selectItem(element.id);});//connects ui buttons to select item function
Elements.forEach(element => element.btn.style.backgroundColor = element.color);//sets the color of the elements ui buttons
Elements.forEach(element => element.btn.onmouseenter = function() {changeDescription(element.desc);});//links button hover events to function with element desc
Elements.forEach(element => element.btn.onmouseleave = function() {clearDescription();});//clears the description text


function selectItem(item) {
  //make clicked on div the selected element
  selectedItem = item;
  document.getElementById('currentElement').innerHTML = Elements[item].name;
}

function changeDescription(desc) {
    document.getElementById('descText').innerHTML = desc;
}
function clearDescription() {
    document.getElementById('descText').innerHTML = '';
}

function think() {
    for (var y = height - 1; y >= 0; y--) {
        var moveHoriz = [];
        for (var x = 0; x < width; x++) {
            // set dir to +1 or -1 randomly
            let randomNum = Math.random()
            var dir = randomNum < 0.5 ? -1 : 1;
            if (getBuf(x, y) == SAND.id) { // if we have sand
                if (!Elements[getBuf(x, y + 1)].isSolid) { // if empty/liquid below
                    if (!Elements[getBuf(x, y + 2)].isSolid) { //if more space to fall
                        if (Math.random() < 0.1 && Elements[getBuf(x + dir, y + 1)].isSolid == false) { //if shifted position is not a wall
                            setBuf(x, y, Elements[getBuf(x + dir, y + 1)].id); // clear sand
                            setBuf(x + dir, y + 1, SAND.id); // move sand shifted over
                        } else {
                            setBuf(x, y, Elements[getBuf(x, y + 1)].id); // clear sand
                            setBuf(x, y + 1, SAND.id); // move sand
                        }
                    } else {
                        setBuf(x, y, Elements[getBuf(x, y + 1)].id); // clear sand
                        setBuf(x, y + 1, SAND.id); // move sand
                    }
                } else if (!Elements[getBuf(x + dir, y + 1)].isSolid) { // if empty/liquid diagonal
                   if (!Elements[getBuf(x + dir, y)].isSolid) { // checks for wall in direction of travel, prevents falling through "cracks"
                        setBuf(x, y, Elements[getBuf(x + dir, y + 1)].id); // clear sand
                        setBuf(x + dir, y + 1, SAND.id); // move sand
                    }
                } 
            } else if (getBuf(x, y) == WATER.id) { // if we have water
                if (getBuf(x, y + 1) == EMPTY.id || getBuf(x, y + 1) == OIL.id) { // if empty below
                    setBuf(x, y, Elements[getBuf(x, y + 1)].id); // clear water
                    setBuf(x, y + 1, WATER.id); // move water
                } else if (getBuf(x + dir, y) == EMPTY.id || getBuf(x + dir, y) == OIL.id) {
                    setBuf(x, y, Elements[getBuf(x + dir, y)].id); // clear water
                    setBuf(x + dir, y, WATER.id); // move water
                    /*moveHoriz.push({
                            x: x,
                            y: y,
                            nx: x + dir,
                            element: WATER
                        });*/
                }
            } else if (getBuf(x, y) == OIL.id) { // if we have oil
                if (getBuf(x, y + 1) == EMPTY.id) { // if empty below
                    setBuf(x, y, Elements[getBuf(x, y + 1)].id); // clear oil
                    setBuf(x, y + 1, OIL.id); // move oil
                } else if (getBuf(x + dir, y) == EMPTY.id || getBuf(x + dir, y) == WATER.id) {
                    moveHoriz.push({
                            x: x,
                            y: y,
                            nx: x + dir,
                            element: OIL.id
                        });
                }
            } else if (getBuf(x, y) == FIRE.id && randomNum < 0.25) { // if we have fire
                if (getBuf(x, y - 1) == OIL.id) { // if oil is above
                    setBuf(x, y - 1, FIRE.id); // turn oil to fire
                }
                if (getBuf(x, y + 1) == OIL.id) {
                    setBuf(x, y + 1, FIRE.id);
                }
                if (getBuf(x - 1, y) == OIL.id) { 
                    setBuf(x - 1, y, FIRE.id);
                }
                if (getBuf(x + 1, y) == OIL.id) {
                    setBuf(x + 1, y, FIRE.id);
                }
                setTimeout(fireBurnOut(x, y), (700 + (randomNum * 1000)));
            }
        }
        for (var i = 0; i < moveHoriz.length; i++) {
            var m = moveHoriz[i];
            if (getBuf(m.x, m.y) == m.element && getBuf(m.nx, m.y) == EMPTY.id) {
                setBuf(m.x, m.y, EMPTY.id); // clear element
                setBuf(m.nx, m.y, m.element); // move element
            }
        }
    }
}

function fireBurnOut(x, y) { // turns fire back into empty
    setBuf(x, y, EMPTY.id);
}

function draw() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            let location = getBuf(x, y);
            
            ctx.fillStyle = Elements[location].color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

let placingInterval;
let cursorX;
let cursorY;

cvs.onmousemove = function(event) {//tracking mouse location for placing
  cursorX = event.clientX - 180;
  cursorY = event.clientY - 60;
  document.getElementById('xCord').innerHTML = Math.floor(cursorX/10);
  document.getElementById('yCord').innerHTML = Math.floor(cursorY/10);
}
cvs.onmousedown = function(event) {//setting the rate at how fast elements are placed
  placingInterval = setInterval(placing, 20, event);
}
cvs.touchmove = function(event) {//tracking finger location for mobile placing
    cursorX = event.clientX;
    cursorY = event.clientY;
}
cvs.touchstart = function(event) {//setting the rate at how fast elements are placed
    placingInterval = setInterval(placing, 20, event);
}

function placing(event) {
  marginVal = parseInt(getComputedStyle(cvs).getPropertyValue('margin-left'));
  setBuf((Math.floor(cursorX/10)) /* + (Math.floor(Math.random() * 3) - 1)*/, Math.floor(cursorY/10), selectedItem);
  console.log(Math.floor(cursorX/10))
  console.log(Math.floor(cursorY/10))
}

cvs.onmouseup = function() {//turns off the placing loop
  clearInterval(placingInterval);
  placingInterval = null;
}
cvs.onmouseleave = function() {//also turns off the placing loop
  clearInterval(placingInterval);
  placingInterval = null;
}
cvs.touchend = function() {//turns off the placing loop for mobile
    clearInterval(placingInterval);
    placingInterval = null;
}
cvs.touchcancel = function() {//also turns off the placing loop for mobile
    clearInterval(placingInterval);
    placingInterval = null;
  }

function tick() {
    think();
    draw();
}

// draw a frame every 0.01 second
setInterval(tick, 10);