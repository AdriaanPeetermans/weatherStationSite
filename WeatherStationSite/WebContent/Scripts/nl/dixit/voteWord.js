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

var connection;
var serverAddress = 'ws://127.0.0.1:';
var serverPort;
var vip = 0;
var name;
var words = [];

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
		connection.send('getWords');
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
		parts = e.data.split("#");
		switch (parts[0]) {
			case "words":
				if (parts[1] == "No") {
					window.open("waiting.html?port=" + serverPort + "&vip=" + vip + "&name=" + name + "&next=giveWord", "_self");
				}
				var numberWords = parseInt(parts[1]);
				for (var i = 0; i < numberWords; i++) {
					words.push(parts[2+i]);
				}
				drawWords();
				connection.send("getVoteTime");
			    break;
			case "voteTime":
				startTime = parseInt(parts[1]);
				nowTime = startTime;
				window.setInterval(timer, 1000);
				break;
		}
	};
}

function drawWords() {
	var block = document.getElementById("voteChoiseBlock");
	for (var i = 0; i < words.length; i++) {
		block.innerHTML = block.innerHTML + "<div class=\"choise\" onmouseover=\"mouseOverChoise(this);\" onmouseout=\"mouseOutChoise(this);\" id=\"" + i + "\" onclick=\"choose(this);\">" + words[i] + "</div>";
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

function mouseOverChoise(el) {
	el.style.backgroundColor = "#D98880";
	el.style.color = "#EBEDEF";
}

function mouseOutChoise(el) {
	el.style.backgroundColor = "#EBEDEF";
	el.style.color = "#2C3E50";
}

function choose(el) {
	connection.send("voted#" + el.innerHTML);
	window.open("waiting.html?port=" + serverPort + "&vip=" + vip + "&name=" + name + "&next=giveWord", "_self");
}