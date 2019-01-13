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

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	startTime = parseInt(queries[1].split("=")[1]);
	nowTime = startTime;
	//window.setInterval(timer, 1000);
	
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send("getColorsHost");
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
		mainCtx.clearRect(endX-vSpacing*0.6, startY-vSpacing*0.45, startX-endX+vSpacing*0.6, vSpacing*1.45);
	}
	else {
		startX = width*startP;
		endX = width*endP;
		mainCtx.clearRect(startX, startY-vSpacing*0.45, endX+vSpacing*0.6-startX, vSpacing*1.45);
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
}

function finishLine(playerIndex, startP, endP) {
	drawPlayerLine(playerIndex, startP, endP);
	var pieceWidth = 0.1;
	var vSpacing = (height - titleHeight)/numberPlayers;
	var endX;
	var startY = titleHeight + vSpacing*(playerIndex+0.5);
	if (playerIndex % 2 == 0) {
		endX = width*(1-endP);
		startX = endX + width*pieceWidth;
	}
	else {
		endX = width*endP;
		startX = endX - width*pieceWidth;
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
}

function timer() {
	nowTime --;
	if (nowTime == 148) {
		playersReady[3] = true;
		var d = new Date();
		var t = d.getTime();
		var perc = (t-startingTime)/1000.0/startTime;
		perc = 0.1 + perc*0.8;
		finishLine(3, 0, perc);
	}
	if (nowTime == 140) {
		playersReady[6] = true;
		var d = new Date();
		var t = d.getTime();
		var perc = (t-startingTime)/1000.0/startTime;
		perc = 0.1 + perc*0.8;
		finishLine(6, 0, perc);
	}
	if (nowTime == 135) {
		playersReady[0] = true;
		var d = new Date();
		var t = d.getTime();
		var perc = (t-startingTime)/1000.0/startTime;
		perc = 0.1 + perc*0.8;
		finishLine(0, 0, perc);
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
}