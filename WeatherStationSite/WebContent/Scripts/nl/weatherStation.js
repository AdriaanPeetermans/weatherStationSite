window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

var connection;

var serverAddress = 'ws://127.0.0.1:9001';
//var serverAddress = 'ws://192.168.1.3:9001';

window.onload = function() {
	connection = new WebSocket(serverAddress);
	
	connection.onopen = function() {
		connection.send("Hela!");
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
	document.getElementById("tempOut").innerHTML = parts[0] + "°C";
	document.getElementById("tempSer").innerHTML = parts[1] + "°C";
	document.getElementById("tempIn").innerHTML = parts[2] + "°C";
	document.getElementById("moistOut").innerHTML = parts[3] + "%";
	document.getElementById("moistSer").innerHTML = parts[4] + "%";
	document.getElementById("moistIn").innerHTML = parts[5] + "%";
	document.getElementById("press").innerHTML = parts[6] + " hPa";
	document.getElementById("lightOut").innerHTML = parts[7];
	document.getElementById("pv").innerHTML = parts[9] + " V";
	document.getElementById("bv").innerHTML = parts[10] + " V";
	document.getElementById("time").innerHTML = parts[11];
}