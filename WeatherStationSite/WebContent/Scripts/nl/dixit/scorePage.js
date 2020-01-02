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

var serverAddress = 'ws://127.0.0.1:';
var serverPort;

var numberPlayers;
var playerOldScores = [];
var playerNewScores = [];

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	numberPlayers = parseInt(queries[1].split("=")[1]);
	for (var i = 0; i < numberPlayers; i++) {
		playerOldScores.push(parseInt(queries[i+2].split("=")[0]));
		playerNewScores.push(parseInt(queries[i+2].split("=")[1]));
	}
	console.log(playerOldScores, playerNewScores);
}