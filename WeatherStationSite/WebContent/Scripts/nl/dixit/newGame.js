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
	//connectServer();
	
	addPlayer("Mira", "abs");
	addPlayer("Adriaan", "iets");
	addPlayer("Jefke", "niets");
}

var serverAddress = 'ws://127.0.0.1:9010';
var connection;

function connectServer() {
	connection = new WebSocket(serverAddress);
	
	connection.onopen = function() {
		connection.send();
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	    buildGraph();
	};
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
		rightButtonHolder.innerHTML = "Code: 1A2B3C";
		animIndex = animIndex + 1;
		rightButtonHolder.style.borderBottomLeftRadius = "6px";
		rightButtonHolder.style.borderTopLeftRadius = "0px";
		window.clearInterval(bottomAnimatorInterval);
	}
}

var playerColors = [["#E3824D", "#4DAEE3"], ["#4DE3A4", "#E34D8C"], ["#80A0D9", "#D9B980"], ["#80D9D1", "#D98088"], ["#E898B3", "#98E8CD"], ["#EDD59F", "#9FB7ED"], ["#CBED9F", "#C19FED"], ["#ED9FCD", "#9FEDBF"]];

var players = [];

function addPlayer(playerName, drawing) {
	var playerNumber = players.length;
	var player = {name: playerName, drawing: drawing, number: playerNumber};
	players.push(player);
	var playerDiv = document.getElementById("player" + playerNumber);
	playerDiv.style.border = "0px solid white";
	playerDiv.innerHTML = "<div class=\"playerNameBlock\" id=\"playerNameBlock" + playerNumber + "\"></div>";
	document.getElementById("playerNameBlock" + playerNumber).innerHTML = "<div class=\"playerNameHolder\" id=\"playerNameHolder" + playerNumber + "\"></div>";
	document.getElementById("playerNameHolder" + playerNumber).innerHTML = playerName;
	document.getElementById("playerNameBlock" + playerNumber).style.backgroundColor = playerColors[playerNumber][0];
	playerDiv.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
	playerDiv.style.borderRadius = "6px";
}








