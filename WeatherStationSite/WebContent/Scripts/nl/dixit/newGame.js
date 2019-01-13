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

var bottomAnimatorInterval;

function init() {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	bottomAnimatorInterval = window.setInterval(bottomAnimator, frameDur);
	getServerPort();
	
//	addPlayer("Mira", "abs");
//	addPlayer("Adriaan", "iets");
//	addPlayer("Jefke", "niets");
}

var serverAddress = 'ws://127.0.0.1:';
var serverPort = 9010;
var connection;

function getServerPort() {
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send('getServer');
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    serverPort = parseInt(e.data);
	    connection.close();
	    connectServer();
	};
}

function connectServer() {
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send("hostGame");
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	};
}

var code = "------";

function respons(mes) {
	var parts = mes.split("#");
	switch (parts[0]) {
		case "code":
			code = parts[1];
			var rightButtonHolder = document.getElementById("rightButtonHolder");
			rightButtonHolder.innerHTML = "Code: " + code;
			break;
		case "newPlayer":
			var playerIndex = parseInt(parts[1]);
			newPlayer(playerIndex);
			break;
		case "addPlayer":
			var playerIndex = parseInt(parts[1]);
			var playerName = parts[2];
			var drawing = parts[3];
			addPlayer(playerName, drawing, playerIndex);
			break;
		case "startGame":
			var waitingTime = parseInt(parts[1]);
			window.open("playersDrawing.html?port=" + serverPort + "&time=" + waitingTime, "_self");
	}
}

var fps = 60;				//Frames/second
var butAnimTime = 0.5;		//Seconds

var frameDur = Math.floor(1000/fps);
var leftButtonSize = 50;
var rightButtonSize = 50;
var nbFrames = Math.round(butAnimTime*1000/frameDur);
var animIndex = 0;
var stepSize = 50/nbFrames;

function bottomAnimator() {
	if (animIndex == 0) {
		document.getElementById("leftButtonholder").innerHTML = "";
		document.getElementById("rightButtonHolder").innerHTML = "";
	}
	if (animIndex < nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = leftButtonSize + "%";
		rightButton.style.width = rightButtonSize + "%";
		leftButtonSize = leftButtonSize - stepSize;
		rightButtonSize = rightButtonSize + stepSize;
		animIndex = animIndex + 1;
		return;
	}
	if (animIndex == nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = "0%";
		rightButton.style.width = "100%";
		var rightButtonHolder = document.getElementById("rightButtonHolder");
		rightButtonHolder.innerHTML = "Code: " + code;
		animIndex = animIndex + 1;
		rightButtonHolder.style.borderBottomLeftRadius = "6px";
		rightButtonHolder.style.borderTopLeftRadius = "0px";
		window.clearInterval(bottomAnimatorInterval);
	}
}

var playerColors = [["#E3824D", "#4DAEE3"], ["#4DE3A4", "#E34D8C"], ["#80A0D9", "#D9B980"], ["#80D9D1", "#D98088"], ["#E898B3", "#98E8CD"], ["#EDD59F", "#9FB7ED"], ["#CBED9F", "#C19FED"], ["#ED9FCD", "#9FEDBF"]];

var players = [];

function addPlayer(playerName, drawing, playerNumber) {
	//var playerNumber = players.length;
	var player = {name: playerName, drawing: drawing, number: playerNumber};
	players.push(player);
	//var playerDiv = document.getElementById("player" + playerNumber);
	//playerDiv.style.border = "0px solid white";
	//playerDiv.innerHTML = "<div class=\"playerNameBlock\" id=\"playerNameBlock" + playerNumber + "\"></div>";
	document.getElementById("playerNameBlock" + playerNumber).innerHTML = "<div class=\"playerNameHolder\" id=\"playerNameHolder" + playerNumber + "\"></div>";
	document.getElementById("playerNameHolder" + playerNumber).innerHTML = playerName;
	document.getElementById("playerNameBlock" + playerNumber).style.backgroundColor = playerColors[playerNumber][0];
	
	
	//playerDiv.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	//playerDiv.style.borderRadius = "6px";
	
	//segment1%segment2%segment3% ..., segment: color&size&length&x0&y0&x1&y1& ...
	var segments = drawing.split("%");
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
	
	var redrawCan = document.getElementById("playerAvatarCan" + playerNumber);
	//var redrawCtx = redrawCan.getContext('2d');
	redraw(playerNumber, drawingXY, redrawCan);
}

//Variable array to hold x and y coordinates of drawing
var drawingXYs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
//var currentSegmentXYs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

//Variables defining the drawing speed.
var redrawPpss = [40, 40, 40, 40, 40, 40, 40, 40];		//Points/second
var segmentDelay = 200;	//Delay in milliseconds between two segments
var maxRedrawTime = 3;	//Max redraw time in seconds

var drawingIndexs = [0, 0, 0, 0, 0, 0, 0, 0];
var redrawCans = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
var redrawCtxs = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
var nbDrawingss = [0, 0, 0, 0, 0, 0, 0, 0];
var redrawSegments = [0, 0, 0, 0, 0, 0, 0, 0];
var redrawPoints = [1, 1, 1, 1, 1, 1, 1, 1];
var redrawIntervals = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
var redrawDelays = [1000/redrawPpss[0], 1000/redrawPpss[1], 1000/redrawPpss[2], 1000/redrawPpss[3], 1000/redrawPpss[4], 1000/redrawPpss[5], 1000/redrawPpss[6], 1000/redrawPpss[7]];
var segmentWaitCntMaxs = [segmentDelay/redrawDelays[0], segmentDelay/redrawDelays[1], segmentDelay/redrawDelays[2], segmentDelay/redrawDelays[3], segmentDelay/redrawDelays[4], segmentDelay/redrawDelays[5], segmentDelay/redrawDelays[6], segmentDelay/redrawDelays[7]];
var segmentWaitCnts = [0, 0, 0, 0, 0, 0, 0, 0];

function redraw(playerIndex, drawingXY, can) {
	drawingXYs[playerIndex] = drawingXY;
	redrawCans[playerIndex] = can;
	redrawCtxs[playerIndex] = can.getContext('2d');
	nbDrawingss[playerIndex] = 0;
	for (var i = 0; i < drawingXYs[playerIndex].length; i++) {
		if (drawingXYs[playerIndex][i].length == 1) {
			nbDrawingss[playerIndex] = nbDrawingss[playerIndex] + 1;
		}
		else {
			nbDrawingss[playerIndex] = nbDrawingss[playerIndex] + drawingXYs[playerIndex][i].x.length - 1;
		}
	}
	if (nbDrawingss[playerIndex]*1.0/redrawPpss[playerIndex] + (drawingXYs[playerIndex].length-1)*segmentDelay*1.0/1000 > maxRedrawTime) {
		redrawPpss[playerIndex] = Math.ceil(nbDrawingss[playerIndex]*1.0/maxRedrawTime);
		redrawDelays[playerIndex] = 1000/redrawPpss[playerIndex];
		segmentWaitCntMaxs[playerIndex] = Math.round(segmentDelay/redrawDelays[playerIndex]);
	}
	//redrawInterval = window.setInterval(redrawPoints, redrawDelay);
	redrawIntervals[playerIndex] = window.setInterval(function() { redrawPointss(playerIndex); }, redrawDelays[playerIndex]);
}

function redrawPointss(playerIndex) {
	if (drawingIndexs[playerIndex] < nbDrawingss[playerIndex]) {
		if (segmentWaitCnts[playerIndex] != 0) {
			segmentWaitCnts[playerIndex] --;
			return;
		}
		//window.alert('hier ' + redrawSegments[playerIndex] + ' ' + drawingIndexs[playerIndex]);
		var segment = drawingXYs[playerIndex][redrawSegments[playerIndex]];
		var segmentColor = segment.color;
		
		var segmentSize = segment.size;
		var redrawCtx = redrawCtxs[playerIndex];
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
			redrawCtx.moveTo(segment.x[redrawPoints[playerIndex]-1],segment.y[redrawPoints[playerIndex]-1]);
			redrawCtx.lineTo(segment.x[redrawPoints[playerIndex]],segment.y[redrawPoints[playerIndex]]);
			redrawCtx.stroke();
		}
		if (redrawPoints[playerIndex] >= segment.x.length-1) {
			redrawSegments[playerIndex] ++;
			redrawPoints[playerIndex] = 1;
			segmentWaitCnts[playerIndex] = segmentWaitCntMaxs[playerIndex]-1;
		}
		else {
			redrawPoints[playerIndex] ++;
		}
		drawingIndexs[playerIndex] ++;
	}
	else {
		window.clearInterval(redrawIntervals[playerIndex]);
	}
}

function newPlayer(playerIndex) {
	var playerDiv = document.getElementById("player" + playerIndex);
	playerDiv.style.border = "0px solid white";
	playerDiv.innerHTML = "<div class=\"playerNameBlock\" id=\"playerNameBlock" + playerIndex + "\"></div> <div class=\"playerAvatarHolder\" id=\"playerAvatarHolder" + playerIndex + "\"></div>";
	document.getElementById("playerAvatarHolder" + playerIndex).innerHTML = "<canvas id=\"playerAvatarCan" + playerIndex + "\" class=\"playerAvatarCan\" width=\"450px\" height=\"550\"></canvas>";
	playerDiv.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	playerDiv.style.borderRadius = "6px";
}






