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
	window.setInterval(loadingIm, frameDelay);
	getParams();
	connectServer();
}

var serverPort;
var vip;
var serverAddress = 'ws://127.0.0.1:';
var connection;
var name;
var nextWindow;
var state;

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	vip = parseInt(queries[1].split("=")[1]);
	name = queries[2].split("=")[1];
	nextWindow = queries[3].split("=")[1];
	switch (nextWindow) {
		case "giveWord":
			state = 1;
			break;
		case "voteWord":
			state = 2;
			break;
		default:
			state = 999;
			break;
	}
}

function connectServer() {
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send("goFurther#" + state);
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	};
}

function respons(mes) {
	var parts = mes.split("#");
	switch(parts[0]) {
		case "endWait":
			window.open(nextWindow + ".html?port=" + serverPort + "&vip=" + vip + "&name=" + name, "_self");
			break;
	}
}

var fps = 40;		//Frames per second
var rps = 0.2;		//Rotations per second

var dpf = rps*360.0/fps;
var frameDelay = 1000.0/fps;
var waitingDeg = 0;

function loadingIm() {
	document.getElementById("waitingIm").style.transform = "rotate(" + waitingDeg + "deg)";
	waitingDeg = waitingDeg + dpf;
	if (waitingDeg >= 360) {
		waitingDeg = waitingDeg - 360;
	}
}