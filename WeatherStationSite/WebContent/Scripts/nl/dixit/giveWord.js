window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

function init() {
	getParams();
    document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
}

var connection;
var serverAddress = 'ws://127.0.0.1:';
var serverPort;
var vip = 0;
var name;

function getParams() {
	var queryString = decodeURIComponent(window.location.search);
	queryString = queryString.substring(1);
	var queries = queryString.split("&");
	serverPort = parseInt(queries[0].split("=")[1]);
	vip = parseInt(queries[1].split("=")[1]);
	name = queries[2].split("=")[1];
	
	document.getElementById("nameHolder").innerHTML = name;
	
	connection = new WebSocket(serverAddress + serverPort);
	
	connection.onopen = function() {
		connection.send('getWordTime');
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
		parts = e.data.split("#");
		switch (parts[0]) {
			case "wordTime":
				startTime = parseInt(parts[1]);
				nowTime = startTime;
				window.setInterval(timer, 1000);
			    break;
			case "waitLonger":
				window.open("waiting.html?port=" + serverPort + "&vip=" + vip + "&name=" + name + "&next=giveWord", "_self");
				break;
		}
	};
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

function readyMouseIn(el) {
	el.style.backgroundColor = "#D98880";
	el.style.color = "#EBEDEF";
}

function readyMouseOut(el) {
	el.style.backgroundColor = "#EBEDEF";
	el.style.color = "#2C3E50";
}

//function ready(canvas, ctx) {
//	ctx.clearRect(0, 0, canvas.width, canvas.height);
//	connection.send("sendDrawing#" + packData());
//	window.open("giveWord.html?port=" + serverPort + "&vip=" + vip + "&name=" + name, "_self");
//}

function wordChange(el) {
	if (el.value.length > 25) {
		el.value = el.value.substring(0,25);
	}
}

function ready() {
	var wordInput = document.getElementById("wordInput");
	if (wordInput.value.length == 0) {
		return;
	}
	connection.send("sendWord#" + wordInput.value);
	window.open("waiting.html?port=" + serverPort + "&vip=" + vip + "&name=" + name + "&next=voteWord", "_self");
	//window.open("voteWord.html?port=" + serverPort + "&vip=" + vip + "&name=" + name, "_self");
}