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

//Score increments:
var correctVoteDrawerPoints;
var correctVotedPoints;
var misleadPoints;

//Parameters for the score:
var wrongTime = 3;				//Number of seconds that wrong word should be highlighted

var wrongWordsPlayers = [];
var previousScores = [];
var currentScores = [];
var currentDrawer;
var correctWord;
var correctPlayers = [];

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
	    		console.log(numberPlayers);
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
	    		console.log("Words have arived:");
	    		console.log(parts);
	    		var numberWords = parseInt(parts[1]);
	    		for (var i = 0; i < numberWords; i++) {
	    			playerContainers[i].innerHTML = parts[2+i];
	    			playerContainers[i].classList.remove('playerWordContainer');
	    			playerContainers[i].classList.add('playerWordContainerNoBlur');
	    		}
	    		break;
	    	case "showPoints":
    			console.log("Votes have arived:");
    			console.log(parts);
    			correctWord = parts[1];
    			currentDrawer = {name: parts[2], color0: parts[3], color1: parts[4], number: parseInt(parts[5])};
    			var numberCorrectPlayers = parseInt(parts[6]);
    			for (var i = 0; i < numberCorrectPlayers; i++) {
    				correctPlayers.push({name: parts[7+i*4], color0: parts[8+i*4], color1: parts[9+i*4], number: parseInt(parts[10+i*4])});
    			}
    			var numberWrongWords = parseInt(parts[7+numberCorrectPlayers*4]);
    			var index = 8+numberCorrectPlayers*4;
    			for (var i = 0; i < numberWrongWords; i++) {
    				var wrongW = parts[index];
    				var thisPlayer = {name: parts[index+1], color0: parts[index+2], color1: parts[index+3], number: parseInt(parts[index+4])};
    				index = index + 4;
    				var players = [];
    				var numberPlayerss = parseInt(parts[index+1]);
    				index = index + 2;
    				for (var j = 0; j < numberPlayerss; j++) {
    					var player = {name: parts[index], color0: parts[index+1], color1: parts[index+2], number: parseInt(parts[index+3])};
    					players.push(player);
    					index = index + 4;
    				}
    				wrongWordsPlayers.push({word: wrongW, thisPlayer: thisPlayer, players: players});
    			}
    			var numberPlayerss = parseInt(parts[index]);
    			index = index + 1;
    			for (var i = 0; i < numberPlayerss; i++) {
    				previousScores.push(parseInt(parts[index]));
    				index = index + 1;
    			}
    			correctVoteDrawerPoints = parseInt(parts[index]);
    			correctVotedPoints = parseInt(parts[index+1]);
    			misleadPoints = parseInt(parts[index+2]);
    			
    			//Determine current scores:
    			for (var i = 0; i < numberPlayerss; i++) {
    				currentScores.push(previousScores[i]);
    			}
    			currentScores[currentDrawer.number] = currentScores[currentDrawer.number] + numberCorrectPlayers*correctVoteDrawerPoints;
    			for (var i = 0; i < numberWrongWords; i++) {
    				currentScores[wrongWordsPlayers[i].thisPlayer.number] = currentScores[wrongWordsPlayers[i].thisPlayer.number] + wrongWordsPlayers[i].players.length*misleadPoints;
    			}
    			for (var i = 0; i < numberCorrectPlayers; i++) {
    				currentScores[correctPlayers[i].number] = currentScores[correctPlayers[i].number] + correctVotedPoints;
    			}
    			
    			var drawerBlock = document.getElementById('drawerHolder');
    			drawerBlock.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
    			var playerBlock = document.getElementById('playerHolder');
    			playerBlock.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
    			setTimeout(showWrong, wrongTime*1000);
    			break;
	    }
	};
}

var wrongWordIndex = 0;

var timePerMisleadPlayer = 1000;
var timePerWrongWord = 5000;
var switchTimeMislead = 500;
var misleadFPS = 60;
var misleadCnt = 0;
var misleadIndex = 0;
var misleadedPlayers;

var correctIndex = 0;

function showWrong() {
	console.log(wrongWordsPlayers, wrongWordIndex);
	if (wrongWordIndex >= wrongWordsPlayers.length) {
		showCorrect();
	}
	else {
		var word = wrongWordsPlayers[wrongWordIndex].word;
		var thisPlayer = wrongWordsPlayers[wrongWordIndex].thisPlayer;
		var index;
		for (var i = 0; i < playerContainers.length; i++) {
			console.log(playerContainers[i].innerHTML);
			if (playerContainers[i].innerHTML == word) {
				index = i;
				break;
			}
		}
		console.log(index);
		playerContainers[index].classList.remove('playerWordContainerNoBlur');
		playerContainers[index].classList.add('playerWordContainerWrong');
		var wordBlock = document.getElementById("playerWordHolder" + index);
		wordBlock.style.backgroundColor = "#EC7063";
		
		var drawerCan = document.getElementById('drawerCan');
		drawerCan.style.backgroundColor = "#" + thisPlayer.color1;
		var drawerCtx = drawerCan.getContext('2d');
		
		// Draw mislead player:
		drawerCtx.fillStyle = "#" + thisPlayer.color0;
		drawerCtx.beginPath();
		drawerCtx.strokeStyle = "#" + thisPlayer.color0;
		drawerCtx.lineWidth = 50;
		drawerCtx.lineCap = "round";
		drawerCtx.moveTo(100, 50);
		drawerCtx.lineTo(300, 50);
		//drawerCtx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		//drawerCtx.shadowBlur = 8;
		//drawerCtx.shadowOffsetX = 0;
		//drawerCtx.shadowOffsetY = 4;
		drawerCtx.stroke();
		
		//Draw player name:
		drawerCtx.font = "30px Arial";
		drawerCtx.fillStyle = "#2C3E50";
		drawerCtx.textBaseline = "middle";
		var textX = Math.round(200 - drawerCtx.measureText(thisPlayer.name).width/2);
		drawerCtx.fillText(thisPlayer.name, textX, 50);
		
		// Draw misleaded players:
		misleadIndex = 0;
		misleadedPlayers = wrongWordsPlayers[wrongWordIndex].players;
		showMisleadedPlayers();
	}
}

function showMisleadedPlayers() {
	var playerCan = document.getElementById('playerCan');
	var playerCtx = playerCan.getContext('2d');
	var misleadedPlayer = misleadedPlayers[misleadIndex];
	if (misleadedPlayers.length == 1) {
		// Background:
		playerCtx.fillStyle = "#" + misleadedPlayer.color1;
		playerCtx.fillRect(0, 0, 400, 100);
		drawPlayerName(playerCtx, "#" + misleadedPlayer.color0, 50, misleadedPlayer.name);
		wrongWordIndex ++;
		setTimeout(showWrong, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/misleadedPlayers.length)));
	}
	else {
		if (misleadIndex == misleadedPlayers.length-1) {
			// Background:
			playerCtx.fillStyle = "#" + misleadedPlayer.color1;
			playerCtx.fillRect(0, 30, 400, 70);
			playerCtx.fillStyle = "#" + misleadedPlayers[misleadIndex-1].color1;
			playerCtx.fillRect(0, 0, 400, 30);
			// First player:
			drawPlayerName(playerCtx, "#" + misleadedPlayers[misleadIndex-1].color0, -5, misleadedPlayers[misleadIndex-1].name);
			// Second player:
			drawPlayerName(playerCtx, "#" + misleadedPlayer.color0, 65, misleadedPlayer.name);
			wrongWordIndex ++;
			setTimeout(showWrong, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/misleadedPlayers.length)));
		}
		else {
			// Background:
			playerCtx.fillStyle = "#" + misleadedPlayer.color1;
			playerCtx.fillRect(0, 0, 400, 70);
			playerCtx.fillStyle = "#" + misleadedPlayers[misleadIndex+1].color1;
			playerCtx.fillRect(0, 70, 400, 30);
			// First player:
			drawPlayerName(playerCtx, "#" + misleadedPlayer.color0, 35, misleadedPlayer.name);
			// Second player:
			drawPlayerName(playerCtx, "#" + misleadedPlayers[misleadIndex+1].color0, 105, misleadedPlayers[misleadIndex+1].name);
			setTimeout(switchMislead, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/misleadedPlayers.length)));
		}
	}
}

function drawPlayerName(ctx, col, y, name) {
	// Container:
	ctx.fillStyle = col;
	ctx.beginPath();
	ctx.strokeStyle = col;
	ctx.lineWidth = 50;
	ctx.lineCap = "round";
	ctx.moveTo(100, y);
	ctx.lineTo(300, y);
	ctx.stroke();
	// Name:
	ctx.font = "30px Arial";
	ctx.fillStyle = "#2C3E50";
	ctx.textBaseline = "middle";
	var textX = Math.round(200 - ctx.measureText(name).width/2);
	ctx.fillText(name, textX, y);
}

function switchMislead() {
	var maxCnt = Math.ceil(misleadFPS*switchTimeMislead/1000.0);
	var playerCan = document.getElementById('playerCan');
	var playerCtx = playerCan.getContext('2d');
	var misleadedPlayer = misleadedPlayers[misleadIndex];
	if (misleadCnt >= maxCnt) {
		misleadCnt = 0;
		misleadIndex ++;
		showMisleadedPlayers();
		return;
	}
	else {
		misleadCnt ++;
	}
	if (misleadIndex == misleadedPlayers.length-2) {
		// Second to last (should shift 40 pixels):
		var pix = Math.round(misleadCnt*1.0/maxCnt*40);
		var border = 70-pix;
		playerCtx.fillStyle = "#" + misleadedPlayer.color1;
		playerCtx.fillRect(0, 0, 400, border);
		playerCtx.fillStyle = "#" + misleadedPlayers[misleadIndex+1].color1;
		playerCtx.fillRect(0, border, 400, 100-border);
		drawPlayerName(playerCtx, "#" + misleadedPlayer.color0, 35-pix, misleadedPlayer.name);
		drawPlayerName(playerCtx, "#" + misleadedPlayers[misleadIndex+1].color0, 105-pix, misleadedPlayers[misleadIndex+1].name);
	}
	else {
		// Normal (should shift 70 pixels):
		var pix = Math.round(misleadCnt*1.0/maxCnt*70);
		var border1 = 70-pix;
		var border2 = 140-pix;
		playerCtx.fillStyle = "#" + misleadedPlayer.color1;
		playerCtx.fillRect(0, 0, 400, border1);
		playerCtx.fillStyle = "#" + misleadedPlayers[misleadIndex+1].color1;
		playerCtx.fillRect(0, border1, 400, 70);
		playerCtx.fillStyle = "#" + misleadedPlayers[misleadIndex+2].color1;
		playerCtx.fillRect(0, border2, 400, 70);
		drawPlayerName(playerCtx, "#" + misleadedPlayer.color0, 35-pix, misleadedPlayer.name);
		drawPlayerName(playerCtx, "#" + misleadedPlayers[misleadIndex+1].color0, border1+35, misleadedPlayers[misleadIndex+1].name);
		drawPlayerName(playerCtx, "#" + misleadedPlayers[misleadIndex+2].color0, border2+35, misleadedPlayers[misleadIndex+2].name);
	}
	setTimeout(switchMislead, Math.round(1000.0/misleadFPS));
}

function showCorrect() {
	console.log(correctWord);
	var index;
	for (var i = 0; i < playerContainers.length; i++) {
		if (playerContainers[i].innerHTML == correctWord) {
			index = i;
			break;
		}
	}
	playerContainers[index].classList.remove('playerWordContainerNoBlur');
	playerContainers[index].classList.add('playerWordContainerCorrect');
	var wordBlock = document.getElementById("playerWordHolder" + index);
	wordBlock.style.backgroundColor = "#7DCEA0";
	
	var drawerCan = document.getElementById('drawerCan');
	drawerCan.style.backgroundColor = "#" + currentDrawer.color1;
	var drawerCtx = drawerCan.getContext('2d');
	
	drawPlayerName(drawerCtx, "#" + currentDrawer.color0, 50, currentDrawer.name);
	
	// Draw correct players:
	correctIndex = 0;
	showCorrectPlayers();
}

function showCorrectPlayers() {
	var playerCan = document.getElementById('playerCan');
	var playerCtx = playerCan.getContext('2d');
	var correctPlayer = correctPlayers[correctIndex];
	if (correctPlayers.length == 1) {
		// Background:
		playerCtx.fillStyle = "#" + correctPlayer.color1;
		playerCtx.fillRect(0, 0, 400, 100);
		drawPlayerName(playerCtx, "#" + correctPlayer.color0, 50, correctPlayer.name);
		setTimeout(toScorePage, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/correctPlayers.length)));
	}
	else {
		if (correctIndex == correctPlayers.length-1) {
			// Background:
			playerCtx.fillStyle = "#" + correctPlayer.color1;
			playerCtx.fillRect(0, 30, 400, 70);
			playerCtx.fillStyle = "#" + correctPlayers[correctIndex-1].color1;
			playerCtx.fillRect(0, 0, 400, 30);
			// First player:
			drawPlayerName(playerCtx, "#" + correctPlayers[correctIndex-1].color0, -5, correctPlayers[correctIndex-1].name);
			// Second player:
			drawPlayerName(playerCtx, "#" + correctPlayer.color0, 65, correctPlayer.name);
			setTimeout(toScorePage, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/correctPlayers.length)));
		}
		else {
			// Background:
			playerCtx.fillStyle = "#" + correctPlayer.color1;
			playerCtx.fillRect(0, 0, 400, 70);
			playerCtx.fillStyle = "#" + correctPlayers[correctIndex+1].color1;
			playerCtx.fillRect(0, 70, 400, 30);
			// First player:
			drawPlayerName(playerCtx, "#" + correctPlayer.color0, 35, correctPlayer.name);
			// Second player:
			drawPlayerName(playerCtx, "#" + correctPlayers[correctIndex+1].color0, 105, correctPlayers[correctIndex+1].name);
			setTimeout(switchCorrect, Math.max(timePerMisleadPlayer, Math.round(timePerWrongWord*1.0/correctPlayers.length)));
		}
	}
}

function switchCorrect() {
	var maxCnt = Math.ceil(misleadFPS*switchTimeMislead/1000.0);
	var playerCan = document.getElementById('playerCan');
	var playerCtx = playerCan.getContext('2d');
	var correctPlayer = correctPlayers[correctIndex];
	if (misleadCnt >= maxCnt) {
		misleadCnt = 0;
		correctIndex ++;
		showCorrectPlayers();
		return;
	}
	else {
		misleadCnt ++;
	}
	if (correctIndex == correctPlayers.length-2) {
		// Second to last (should shift 40 pixels):
		var pix = Math.round(misleadCnt*1.0/maxCnt*40);
		var border = 70-pix;
		playerCtx.fillStyle = "#" + correctPlayer.color1;
		playerCtx.fillRect(0, 0, 400, border);
		playerCtx.fillStyle = "#" + correctPlayers[correctIndex+1].color1;
		playerCtx.fillRect(0, border, 400, 100-border);
		drawPlayerName(playerCtx, "#" + correctPlayer.color0, 35-pix, correctPlayer.name);
		drawPlayerName(playerCtx, "#" + correctPlayers[correctIndex+1].color0, 105-pix, correctPlayers[correctIndex+1].name);
	}
	else {
		// Normal (should shift 70 pixels):
		var pix = Math.round(misleadCnt*1.0/maxCnt*70);
		var border1 = 70-pix;
		var border2 = 140-pix;
		playerCtx.fillStyle = "#" + correctPlayer.color1;
		playerCtx.fillRect(0, 0, 400, border1);
		playerCtx.fillStyle = "#" + correctPlayers[correctIndex+1].color1;
		playerCtx.fillRect(0, border1, 400, 70);
		playerCtx.fillStyle = "#" + correctPlayers[correctIndex+2].color1;
		playerCtx.fillRect(0, border2, 400, 70);
		drawPlayerName(playerCtx, "#" + correctPlayer.color0, 35-pix, correctPlayer.name);
		drawPlayerName(playerCtx, "#" + correctPlayers[correctIndex+1].color0, border1+35, correctPlayers[correctIndex+1].name);
		drawPlayerName(playerCtx, "#" + correctPlayers[correctIndex+2].color0, border2+35, correctPlayers[correctIndex+2].name);
	}
	setTimeout(switchCorrect, Math.round(1000.0/misleadFPS));
}

function toScorePage() {
	var nextPage = "scorePage.html?port=" + serverPort + "&numberPlayers=" + previousScores.length;
	for (var i = 0; i < previousScores.length; i++) {
		nextPage = nextPage + "&" + previousScores[i] + "=" + currentScores[i];
	}
	window.open(nextPage, "_self");
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
	console.log(numberPlayers);
	for (var i = 0; i < numberPlayers; i++) {
		var wordBlock = document.getElementById("playerWordHolder" + i);
		wordBlock.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
		wordBlock.innerHTML = "<div class=\"playerWordContainer\" id=\"playerWordContainer" + i + "\"></div>";
		var container = document.getElementById("playerWordContainer" + i);
		var phase = 25*i/(numberPlayers);
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
