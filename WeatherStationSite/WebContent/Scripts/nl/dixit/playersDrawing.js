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

var mainCan;
var mainCtx;
var height;
var width;

function init() {
	height = window.innerHeight-74;
	width = window.innerWidth;
	document.getElementById("mainBlock").style.height = height + "px";
	document.getElementById("mainBlock").innerHTML = "<canvas id=\"mainCan\" width=\"" + width + "px\" height=\"" + height + "px\"></canvas>"
	mainCan = document.getElementById("mainCan");
	mainCan.style.height = height + "px";
	mainCan.style.width = width + "px";
	mainCtx = mainCan.getContext('2d');
	getParams();
}

var connection;
var serverAddress = 'ws://127.0.0.1:';
var serverPort;
var startTime;
var nowTime;
var playerColors = [];
var numberPlayers;
var playersReady = [false, false, false, false, false, false, false, false];
var startingTime;
var playerNames = [];

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	startTime = parseInt(queries[1].split("=")[1]);
	nowTime = startTime;
	
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send("getPlayerNames");
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
		parts = e.data.split("#");
		switch (parts[0]) {
			case "readyDrawing":
				var playerIndex = parseInt(parts[1]);
				playerReady(playerIndex);
			    break;
			case "playerColors":
				numberPlayers = parseInt(parts[1]);
				var numberColors = parseInt(parts[2]);
				for (var i = 0; i < numberColors; i++) {
					var color1 = "#" + parts[2*i+3];
					var color2 = "#" + parts[2*i+4];
					var playerColor = {color1: color1, color2: color2};
					playerColors.push(playerColor);
				}
				prepareCan();
				var d = new Date();
				startingTime = d.getTime();
				window.setInterval(timer, 1000);
				window.setInterval(linesTimer, lineDelay);
				drawInit();
				break;
			case "playerNames":
				var number = parseInt(parts[1]);
				for (var i = 0; i < number; i++) {
					playerNames[i] = parts[i+2];
				}
				connection.send("getColorsHost");
				break;
		}
	};
}

function prepareCan() {
	for (var i = 0; i < numberPlayers; i++) {
		drawPlayerLine(i, 0, 0.1);
	}
}

var titleHeight = 200;

function drawPlayerLine(playerIndex, startP, endP) {
	var vSpacing = (height - titleHeight)/numberPlayers;
	var startX;
	var endX;
	var startY = titleHeight + vSpacing*(playerIndex+0.5);
	if (playerIndex % 2 == 0) {
		startX = width*(1-startP);
		endX = width*(1-endP);
		mainCtx.clearRect(endX-vSpacing*0.6, startY-vSpacing*0.45, startX-endX+vSpacing*0.6, vSpacing*1.1);
		mainCtx.textAlign = "left";
	}
	else {
		startX = width*startP;
		endX = width*endP;
		mainCtx.clearRect(startX, startY-vSpacing*0.45, endX+vSpacing*0.6-startX, vSpacing*1.1);
		mainCtx.textAlign = "right";
	}
	mainCtx.fillStyle = playerColors[playerIndex].color1;
	mainCtx.beginPath();
	mainCtx.strokeStyle = playerColors[playerIndex].color1;
	mainCtx.lineWidth = vSpacing*0.6;
	mainCtx.lineCap = "round";
	mainCtx.moveTo(startX,startY);
	mainCtx.lineTo(endX,startY);
	mainCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	mainCtx.shadowBlur = 8;
	mainCtx.shadowOffsetX = 0;
	mainCtx.shadowOffsetY = 4;
	mainCtx.stroke();
	mainCtx.shadowColor = 'rgba(0, 0, 0, 0.19)';
	mainCtx.shadowBlur = 15;
	mainCtx.shadowOffsetX = 0;
	mainCtx.shadowOffsetY = 6;
	mainCtx.stroke();
	
	mainCtx.shadowColor = 'rgba(0, 0, 0, 0)';
	mainCtx.fillStyle = "#2C3E50";
	mainCtx.textBaseline = "middle"
	mainCtx.font = vSpacing*0.5 + "px Arial";
	mainCtx.fillText(playerNames[playerIndex], endX, startY);
}

function finishLine(playerIndex, startP, endP) {
	drawPlayerLine(playerIndex, startP, endP);
	//var pieceWidth = 0.1;
	var vSpacing = (height - titleHeight)/numberPlayers;
	var endX;
	var startY = titleHeight + vSpacing*(playerIndex+0.5);
	var pieceWidth = mainCtx.measureText(playerNames[playerIndex]).width;
	if (playerIndex % 2 == 0) {
		endX = width*(1-endP);
		//startX = endX + width*pieceWidth;
		startX = endX + pieceWidth;
		mainCtx.textAlign = "left";
	}
	else {
		endX = width*endP;
		//startX = endX - width*pieceWidth;
		startX = endX - pieceWidth;
		mainCtx.textAlign = "right";
	}
	mainCtx.fillStyle = playerColors[playerIndex].color2;
	mainCtx.beginPath();
	mainCtx.strokeStyle = playerColors[playerIndex].color2;
	mainCtx.lineWidth = vSpacing*0.6;
	mainCtx.lineCap = "round";
	mainCtx.moveTo(startX,startY);
	mainCtx.lineTo(endX,startY);
	mainCtx.shadowColor = 'rgba(0, 0, 0, 0)';
	mainCtx.shadowBlur = 0;
	mainCtx.shadowOffsetX = 0;
	mainCtx.shadowOffsetY = 0;
	mainCtx.stroke();
	
	mainCtx.shadowColor = 'rgba(0, 0, 0, 0)';
	mainCtx.fillStyle = "#E0E0E0";
	mainCtx.textBaseline = "middle"
	mainCtx.font = vSpacing*0.5 + "px Arial";
	mainCtx.fillText(playerNames[playerIndex], endX, startY);
}

function timer() {
	var oldSecond = nowTime%60;
	var oldMinute = (nowTime-oldSecond)/60;
	nowTime --;
	var second = nowTime%60;
	var minute = (nowTime-second)/60;
	shifterIntervals[4] = window.setInterval(function() { shiftChar(stringLength(oldSecond, 2).substring(1,2), stringLength(second, 2).substring(1,2), 4); }, shiftDelay);
	if (stringLength(oldSecond, 2).substring(0,1) != stringLength(second, 2).substring(0,1)) {
		shifterIntervals[3] = window.setInterval(function() { shiftChar(stringLength(oldSecond, 2).substring(0,1), stringLength(second, 2).substring(0,1), 3); }, shiftDelay);
	}
	if (stringLength(oldMinute, 2).substring(1,2) != stringLength(minute, 2).substring(1,2)) {
		shifterIntervals[2] = window.setInterval(function() { shiftChar(stringLength(oldMinute, 2).substring(1,2), stringLength(minute, 2).substring(1,2), 2); }, shiftDelay);
	}
	if (stringLength(oldMinute, 2).substring(0,1) != stringLength(minute, 2).substring(0,1)) {
		shifterIntervals[1] = window.setInterval(function() { shiftChar(stringLength(oldMinute, 2).substring(0,1), stringLength(minute, 2).substring(0,1), 1); }, shiftDelay);
	}
}

var fps = 30;

var lineDelay = 1000/fps;

function linesTimer() {
	var d = new Date();
	var t = d.getTime();
	var perc = (t-startingTime)/1000.0/startTime;
	perc = 0.1 + perc*0.8;
	for (var i = 0; i < numberPlayers; i++) {
		if (!playersReady[i]) {
			drawPlayerLine(i, 0, perc)
		}
	}
}

function playerReady(playerIndex) {
	playersReady[playerIndex] = true;
	var d = new Date();
	var t = d.getTime();
	var perc = (t-startingTime)/1000.0/startTime;
	perc = 0.1 + perc*0.8;
	finishLine(playerIndex, 0, perc);
	var numberReady = 0;
	for (var i = 0; i < numberPlayers; i++) {
		if (playersReady[i]) {
			numberReady ++;
		}
	}
	shifterIntervals[0] = window.setInterval(function() { shiftChar(numberPlayers-numberReady+1, numberPlayers-numberReady, 0); }, shiftDelay);
	if (numberReady == numberPlayers) {
		window.open("showDrawing.html?port=" + serverPort + "&drawing=0", "_self");
	}
}

var shiftFps = 40;
var shiftDur = 0.5 ;		//Seconds

var shiftDelay = 1000/shiftFps;
var maxShiftTimer = shiftDur*shiftFps;

var shiftTimers = [0, 0, 0, 0, 0];		//readyPlayers, min0, min1, sec0, sec1
var shifterIntervals = [undefined, undefined, undefined, undefined, undefined];

function shiftChar(prev, next, shiftIndex) {
	if (shiftTimers[shiftIndex] >= maxShiftTimer+1) {
		window.clearInterval(shifterIntervals[shiftIndex]);
		shiftTimers[shiftIndex] = 0;
		return;
	}
	var shiftCtx;
	if (shiftIndex == 0) {
		shiftCtx = document.getElementById("leftTitle").getContext('2d');
	}
	else {
		shiftCtx = document.getElementById("rightTitle").getContext('2d');
	}
	shiftCtx.fillStyle = "#2C3E50";
	shiftCtx.textBaseline = "middle"
	shiftCtx.textAlign = "center";
	shiftCtx.font = "50px Arial";
	var xpos;
	switch (shiftIndex) {
		case 0:
			xpos = 75;
			break;
		case 1:
			xpos = 20;
			break;
		case 2:
			xpos = 50;
			break;
		case 3:
			xpos = 100;
			break;
		case 4:
			xpos = 130;
			break;
	}
	var ypos = 55 + shiftTimers[shiftIndex]*1.0/maxShiftTimer*100;
	shiftCtx.clearRect(xpos-15, 0, 30, 100);
	shiftCtx.fillText(prev, xpos, ypos);
	shiftCtx.fillText(next, xpos, ypos-100);
	shiftTimers[shiftIndex] = shiftTimers[shiftIndex] + 1;
}

function drawInit() {
	var ctx1 = document.getElementById("leftTitle").getContext('2d');
	ctx1.fillStyle = "#2C3E50";
	ctx1.textBaseline = "middle"
	ctx1.textAlign = "center";
	ctx1.font = "50px Arial";
	ctx1.fillText(numberPlayers, 75, 55);
	
	var ctx2 = document.getElementById("rightTitle").getContext('2d');
	var seconds = nowTime%60;
	var minutes = (nowTime-seconds)/60;
	ctx2.fillStyle = "#2C3E50";
	ctx2.textBaseline = "middle"
	ctx2.textAlign = "center";
	ctx2.font = "50px Arial";
	ctx2.fillText(stringLength(minutes, 2).substring(0,1), 20, 55);
	ctx2.fillText(stringLength(minutes, 2).substring(1,2), 50, 55);
	ctx2.fillText(":", 75, 50);
	ctx2.fillText(stringLength(seconds, 2).substring(0,1), 100, 55);
	ctx2.fillText(stringLength(seconds, 2).substring(1,2), 130, 55);
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







