window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

window.onresize = function(e) {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
}

function init() {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	getParams();
}

var serverAddress = 'ws://127.0.0.1:';
var serverPort;
var drawingNumber;
var connection;
var numberPlayers;

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	drawingNumber = parseInt(queries[1].split("=")[1]);
	
	document.getElementById("nameHolder").innerHTML = "Tekening " + drawingNumber;
	
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send('getDrawing#' + drawingNumber);
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
		console.log(e.data);
		parts = e.data.split("#");
	    switch (parts[0]) {
	    	case "drawing":
	    		numberPlayers = parseInt(parts[1]);
	    		startTime = parseInt(parts[2]);
	    		nowTime = startTime;
	    		var drawing = unPackDrawing(parts[3]);
	    		window.setInterval(timer, 1000);
	    		redraw(drawing);
	    		drawWordHolders();
	    		break;
	    	case "voteWord":
	    		//window.open("voteWordHost.html?port=" + serverPort + "&drawing=" + drawingNumber, "_self");
	    		window.clearInterval(holderTimer);
	    		connection.send("getWords");
	    		break;
	    	case "words":
	    		var numberWords = parseInt(parts[1]);
	    		for (var i = 0; i < numberWords; i++) {
	    			playerContainers[i].innerHTML = parts[2+i];
	    			playerContainers[i].classList.remove('playerWordContainer');
	    			playerContainers[i].classList.add('playerWordContainerNoBlur');
	    		}
	    		break;
	    }
	};
}

function unPackDrawing(drawingStr) {
	var segments = drawingStr.split("%");
	var drawingXY = [];
	for (var i = 0; i < segments.length; i++) {
		var seg = segments[i].split("&");
		var segmentColor = "#" + seg[0];
		var segmentSize = parseInt(seg[1]);
		var segmentLength = parseInt(seg[2]);
		var segx = [];
		var segy = [];
		for (var j = 0; j < segmentLength; j++) {
			segx.push(parseInt(seg[3+j*2]));
			segy.push(parseInt(seg[4+j*2]));
		}
		var segment = {color: segmentColor, size: segmentSize, x: segx, y: segy};
		drawingXY.push(segment);
	}
	return drawingXY;
}

var redrawPps = 40;		//Points/second
var segmentDelay = 200;	//Delay in milliseconds between two segments
var maxRedrawTime = 3;	//Max redraw time in seconds

var drawingIndex = 0;
//var redrawCans = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
//var redrawCtxs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
var nbDrawings = 0;
var redrawSegment = 0;
var redrawPoint = 1;
var redrawInterval;
var redrawDelay = 1000/redrawPps;
var segmentWaitCntMax = segmentDelay/redrawDelay;
var segmentWaitCnt = 0;

function redraw(drawingXY) {
	nbDrawings = 0;
	for (var i = 0; i < drawingXY.length; i++) {
		if (drawingXY[i].length == 1) {
			nbDrawings = nbDrawings + 1;
		}
		else {
			nbDrawings = nbDrawings + drawingXY[i].x.length - 1;
		}
	}
	if (nbDrawings*1.0/redrawPps + (drawingXY.length-1)*segmentDelay*1.0/1000 > maxRedrawTime) {
		redrawPps = Math.ceil(nbDrawings*1.0/maxRedrawTime);
		redrawDelay = 1000/redrawPps;
		segmentWaitCntMax = Math.round(segmentDelay/redrawDelay);
	}
	//redrawInterval = window.setInterval(redrawPoints, redrawDelay);
	redrawInterval = window.setInterval(function() { redrawPoints(drawingXY); }, redrawDelay);
}

function redrawPoints(drawingXY) {
	if (drawingIndex < nbDrawings) {
		if (segmentWaitCnt != 0) {
			segmentWaitCnt --;
			return;
		}
		var segment = drawingXY[redrawSegment];
		var segmentColor = segment.color;
		
		var segmentSize = segment.size;
		var redrawCtx = document.getElementById("sketchpad").getContext('2d');
		redrawCtx.fillStyle = segmentColor;
		redrawCtx.beginPath();
		
		if (segment.x.length == 1) {
			redrawCtx.arc(segment.x[0], segment.y[0], segmentSize, 0, Math.PI*2, true);
			redrawCtx.closePath();
			redrawCtx.fill();
		}
		else {
			redrawCtx.strokeStyle = segmentColor;
			redrawCtx.lineWidth = 2*segmentSize;
			redrawCtx.lineCap = "round";
			redrawCtx.moveTo(segment.x[redrawPoint-1],segment.y[redrawPoint-1]);
			redrawCtx.lineTo(segment.x[redrawPoint],segment.y[redrawPoint]);
			redrawCtx.stroke();
		}
		if (redrawPoint >= segment.x.length-1) {
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

var startTime;	//Seconds
var nowTime;

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

var playerContainers = [];
var dirs = [1, 1, 1, 1, 1, 1, 1, 1, 1];
var holderTimer;

function drawWordHolders() {
	for (var i = 0; i < numberPlayers+1; i++) {
		var wordBlock = document.getElementById("playerWordHolder" + i);
		wordBlock.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
		wordBlock.innerHTML = "<div class=\"playerWordContainer\" id=\"playerWordContainer" + i + "\"></div>";
		var container = document.getElementById("playerWordContainer" + i);
		var phase = 25*i/(numberPlayers+1);
		var str = "";
		for (var j = 0; j < phase; j++) {
			str = str + "x";
		}
		container.innerHTML = str;
		playerContainers.push(container);
	}
	holderTimer = window.setInterval(function() { wordHolderTimer(); }, htDelay);
}

var htWps = 8;

var htDelay = 1000/htWps;

function wordHolderTimer() {
	for (var i = 0; i < playerContainers.length; i++) {
		if (dirs[i] == 1) {
			if (playerContainers[i].innerHTML.length >= 25) {
				dirs[i] = -1;
			}
		}
		else {
			if (playerContainers[i].innerHTML.length <= 0) {
				dirs[i] = 1;
			}
		}
		if (dirs[i] == 1) {
			playerContainers[i].innerHTML = playerContainers[i].innerHTML + "x";
		}
		else {
			playerContainers[i].innerHTML = playerContainers[i].innerHTML.substring(0,playerContainers[i].innerHTML.length-1);
		}
	}
}
