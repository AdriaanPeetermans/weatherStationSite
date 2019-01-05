window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

// Variables for referencing the canvas and 2dcanvas context
var canvas,ctx;

// Variables to keep track of the mouse position and left-button status 
var mouseX,mouseY,mouseDown=0,mousePrevX=-1,mousePrevY=-1;

// Variables to keep track of the touch position
var touchX,touchY,touxhPrevX=-1,touchPrevY=-1;

// Variable array to hold x and y coordinates of drawing
var drawingXY = [];
var currentSegmentXY = [];

// Variables defining the drawing speed.
var redrawPps = 40;		//Points/second
var segmentDelay = 200;	//Delay in milliseconds between two segments

var drawingIndex = 0;
var redrawCan;
var redrawCtx;
var nbDrawings = 0;
var redrawSegment = 0;
var redrawPoint = 1;
var redrawInterval;
var redrawDelay = 1000/redrawPps;
var segmentWaitCntMax = segmentDelay/redrawDelay;
var segmentWaitCnt = 0;

function redrawPoints() {
	if (drawingIndex < nbDrawings) {
		if (segmentWaitCnt != 0) {
			segmentWaitCnt --;
			return;
		}
		var segment = drawingXY[redrawSegment];
		var segmentColor = segment[0].color;
		var segmentSize = segment[0].size;
		redrawCtx.fillStyle = segmentColor;
		redrawCtx.beginPath();
		if (segment.length == 1) {
			redrawCtx.arc(segment[0].x, segment[0].y, segmentSize, 0, Math.PI*2, true);
			redrawCtx.closePath();
			redrawCtx.fill();
		}
		else {
			redrawCtx.strokeStyle = segmentColor;
			redrawCtx.lineWidth = 2*segmentSize;
			redrawCtx.lineCap = "round";
			redrawCtx.moveTo(segment[redrawPoint-1].x,segment[redrawPoint-1].y);
			redrawCtx.lineTo(segment[redrawPoint].x,segment[redrawPoint].y);
			redrawCtx.stroke();
		}
		if (redrawPoint >= segment.length-1) {
			redrawSegment ++;
			redrawPoint = 1;
			segmentWaitCnt = segmentWaitCntMax-1;
		}
		else {
			redrawPoint ++;
		}
		drawingIndex ++;
	}
	else {
		window.clearInterval(redrawInterval);
	}
}

function redraw() {
	nbDrawings = 0;
	for (var i = 0; i < drawingXY.length; i++) {
		if (drawingXY[i].length == 1) {
			nbDrawings = nbDrawings + 1;
		}
		else {
			nbDrawings = nbDrawings + drawingXY[i].length - 1;
		}
	}
	redrawInterval = window.setInterval(redrawPoints, redrawDelay);
	
//	for (var i = 0; i < drawingXY.length; i++) {
//		var segment = drawingXY[i];
//		var segmentColor = segment[0].color;
//		var segmentSize = segment[0].size;
//		ctx.fillStyle = segmentColor;
//		ctx.beginPath();
//		if (segment.length == 1) {
//			ctx.arc(segment[0].x, segment[0].y, segmentSize, 0, Math.PI*2, true);
//			ctx.closePath();
//			ctx.fill();
//			
//		}
//		else {
//			for (j = 1; j < segment.length; j++) {
//				ctx.strokeStyle = segmentColor;
//				ctx.lineWidth = 2*segmentSize;
//				ctx.lineCap = "round";
//				ctx.moveTo(segment[j-1].x,segment[j-1].y);
//				ctx.lineTo(segment[j].x,segment[j].y);
//				ctx.stroke();
//			}
//		}
//	}
}

// Draws a dot at a specific position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function drawLine(ctx,x,y, prevx, prevy) {
	//ctx.globalAlpha = 0.7;
	ctx.fillStyle = color;
	ctx.beginPath();
	if ((prevx > 0) && (prevy > 0)) {
		ctx.strokeStyle = color;
		ctx.lineWidth = 2*size;
		ctx.lineCap = "round";
		ctx.moveTo(prevx,prevy);
		ctx.lineTo(x,y);
		ctx.stroke();
	}
	else {
	    ctx.arc(x, y, size, 0, Math.PI*2, true); 
	    ctx.closePath();
	    ctx.fill();
	}
	var point = {x: x, y: y, color: color, size: size};
	currentSegmentXY.push(point);
} 

// Clear the canvas context using the canvas width and height
function clearCanvas(canvas,ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Keep track of the mouse button being pressed and draw a dot at current location
function sketchpad_mouseDown() {
    mouseDown=1;
    drawLine(ctx, mouseX, mouseY, mousePrevX, mousePrevY);
    mousePrevX = mouseX;
    mousePrevY = mouseY;
}

// Keep track of the mouse button being released
function sketchpad_mouseUp() {
    mouseDown=0;
    mousePrevX = -1;
    mousePrevY = -1;
    if (currentSegmentXY.length > 0) {
    	drawingXY.push(currentSegmentXY);
    	currentSegmentXY = [];
    }
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function sketchpad_mouseMove(e) { 
    // Update the mouse co-ordinates when moved
    getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (mouseDown==1) {
        drawLine(ctx, mouseX, mouseY, mousePrevX, mousePrevY);
        mousePrevX = mouseX;
        mousePrevY = mouseY;
    }
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
 }

// Draw something when a touch start is detected
function sketchpad_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    drawLine(ctx,touchX,touchY,touchPrevX,touchPrevY);
    touchPrevX = touchX;
    touchPrevY = touchY;

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

// Draw something and prevent the default scrolling when touch movement is detected
function sketchpad_touchMove(e) { 
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    drawLine(ctx,touchX,touchY,touchPrevX,touchPrevY); 
    touchPrevX = touchX;
    touchPrevY = touchY;

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

function sketchpad_touchEnd() {
	touchPrevX = -1;
	touchPrevY = -1;
	if (currentSegmentXY.length > 0) {
    	drawingXY.push(currentSegmentXY);
    	currentSegmentXY = [];
    }
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX=touch.pageX-touch.target.offsetLeft;
            touchY=touch.pageY-touch.target.offsetTop;
        }
    }
}


// Set-up the canvas and add our event handlers after the page has loaded
function init() {
    // Get the specific canvas element from the HTML document
    canvas = document.getElementById('sketchpad');

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    // Check that we have a valid context to draw on/with before adding event handlers
    if (ctx) {
        // React to mouse events on the canvas, and mouseup on the entire document
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        window.addEventListener('mouseup', sketchpad_mouseUp, false);

        // React to touch events on the canvas
        canvas.addEventListener('touchstart', sketchpad_touchStart, false);
        canvas.addEventListener('touchmove', sketchpad_touchMove, false);
        canvas.addEventListener('touchend', sketchpad_touchEnd, false);
    }
    
    //Redrawer:
    redrawCan = document.getElementById("redrawCan");
    redrawCtx = redrawCan.getContext('2d');
    
    //drawShowerDot:
    drawDotShower();
    
    //Init timer:
    window.setInterval(timer, 1000);
}

//var color1 = "#80A0D9";
var color1 = "#80D9D1";

//var color2 = "#D9B980";
var color2 = "#D98088";

var color = color1;

var size = 15;

var maxSize = 30;

var minSize = 5;

var startTime = 120;	//Seconds

var nowTime = startTime;

function drawDotShower() {
	var showerCanvas = document.getElementById("sizeShowerCanvas");
    var showerCtx = showerCanvas.getContext('2d');
    showerCtx.clearRect(0, 0, 65, 65);
    showerCtx.fillStyle = color;
    showerCtx.beginPath();
    showerCtx.arc(32.5, 32.5, size, 0, Math.PI*2, true); 
    showerCtx.closePath();
    showerCtx.fill();
}

function changeSize(el) {
	size = (el.value-1)/98*(maxSize-minSize)+minSize;
	drawDotShower();
}

function ready(anvas,ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw();
}

function changeColor(col) {
	if (col == 1) {
		color = color1;
	}
	else {
		color = color2;
	}
	drawDotShower();
}

//timing:
function timer() {
	var sec = nowTime%60;
	var min = Math.round((nowTime-sec)/60);
	var timeHolder = document.getElementById("timeHolder");
	timeHolder.innerHTML = stringLength(min,2) + ":" + stringLength(sec, 2);
	var loadCan = document.getElementById("loadCan");
	var loadCtx = loadCan.getContext('2d');
	var width = (startTime-nowTime)*1.0/startTime*loadCan.width;
	loadCtx.fillStyle = "#D98880";
	loadCtx.fillRect(0, 0, width, loadCan.height);
	nowTime = nowTime - 1;
}

function stringLength(number, length) {
	var result = "" + number;
	var l = result.length;
	if (l < length) {
		for (var i = 0; i < length-l; i++) {
			result = "0" + result;
		}
	}
	else {
		if (l > length) {
			result = result.substring(l-length, l);
		}
	}
	return result;
}
    
//Styling:
	//Ready button:
function readyMouseIn() {
	var readyBut = document.getElementById("readyButton");
	readyBut.style.color = "darkred";
}

function readyMouseOut() {
	var readyBut = document.getElementById("readyButton");
	readyBut.style.color = "#2C3E50";
}