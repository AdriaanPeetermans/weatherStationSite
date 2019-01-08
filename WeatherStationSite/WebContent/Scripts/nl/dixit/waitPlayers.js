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
	if (host) {
		drawHostButton();
	}
}

var serverPort;
var host;

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	host = parseInt(queries[1].split("=")[1]);
}

function drawHostButton() {
	var buttonBlock = document.getElementById("buttonBlock");
	buttonBlock.innerHTML = "Start het spel!";
	buttonBlock.addEventListener('mouseover', mouseIn, false);
	buttonBlock.addEventListener('mouseout', mouseOut, false);
	buttonBlock.addEventListener('click', startGame, false);
	buttonBlock.style.cursor = "pointer";
}

function startGame() {
	
}

function mouseIn() {
	el = document.getElementById("buttonBlock");
	el.style.color = "#EBEDEF";
}

function mouseOut() {
	el = document.getElementById("buttonBlock");
	el.style.color = "#2C3E50";
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