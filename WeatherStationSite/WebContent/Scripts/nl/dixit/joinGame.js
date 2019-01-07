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
	bottomAnimatorInterval = window.setInterval(bottomAnimator, frameDur);
	getServerPort();
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
		document.getElementById("rightButtonHolder").innerHTML = "";
	}
	if (animIndex < nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = leftButtonSize + "%";
		rightButton.style.width = rightButtonSize + "%";
		leftButtonSize = leftButtonSize + stepSize;
		rightButtonSize = rightButtonSize - stepSize;
		animIndex = animIndex + 1;
		return;
	}
	if (animIndex == nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = "100%";
		rightButton.style.width = "0%";
		var leftButtonHolder = document.getElementById("leftButtonHolder");
		animIndex = animIndex + 1;
		leftButtonHolder.style.borderBottomRightRadius = "6px";
		leftButtonHolder.style.borderTopRightRadius = "0px";
		window.clearInterval(bottomAnimatorInterval);
	}
}

function mouseIn(el) {
	el.style.color = "#EBEDEF";
}

function mouseOut(el) {
	el.style.color = "#2C3E50";
}

function codeChange(el) {
	if (el.value.length > 6) {
		el.value = el.value.substring(0,6);
	}
	drawChecker(el.value.length);
	if (el.value.length != 6) {
		document.getElementById("checkIm").src = "../../../Images/dixit/checkUnknown.png";
		return;
	}
	checkCode(el.value);
}

function drawChecker(length) {
	var checkerCan = document.getElementById("checkerCan");
	var checkerCtx = checkerCan.getContext('2d');
	checkerCtx.clearRect(0, 0, checkerCan.width, checkerCan.height);
	checkerCtx.fillStyle = "#80D9B2";
	checkerCtx.fillRect(0, 0, checkerCan.width*length/6.0, checkerCan.height);
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
	};
}

function checkCode(code) {
	if (code.length != 6) {
		return -1;
	}
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send('checkCode#' + code);
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
		if (e.data == 1) {
			document.getElementById("checkIm").src = "../../../Images/dixit/checkCorrect.png";
		}
		else {
			document.getElementById("checkIm").src = "../../../Images/dixit/checkWrong.png";
		}	
	    connection.close();
	};
}

function join() {
	code = document.getElementById("codeInput").value;
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send('joinGame#' + code);
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    connection.close();
	    if (e.data == 1) {
	    	window.open("drawAvatar.html?port=" + serverPort, "_self");
	    }
	    else {
	    	document.getElementById("codeInput").value = "";
	    	drawChecker(0);
	    }
	};
}