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
	document.getElementById("object").style.height = window.innerHeight-70 + "px";
	document.getElementById("mainBlock").style.width = window.innerWidth-301 + "px";
	document.getElementById("object").style.width = window.innerWidth-301 + "px";
}

function init() {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	document.getElementById("object").style.height = window.innerHeight-70 + "px";
	document.getElementById("mainBlock").style.width = window.innerWidth-301 + "px";
	document.getElementById("object").style.width = window.innerWidth-301 + "px";
}

activeButton = 0;

function mouseOverButton(el,id) {
	if (id != activeButton) {
		el.style.backgroundColor = "#AEB6BF";
	}
}

function mouseOutButton(el,id) {
	if (id != activeButton) {
		el.style.backgroundColor = "#E0E0E0";
	}
}

function files() {
	document.getElementById("but" + activeButton).className = "sideButton";
	document.getElementById("but" + activeButton).style.backgroundColor = "#E0E0E0";
	activeButton = 0;
	document.getElementById("but0").className = "activeSideButton";
	document.getElementById("but0").style.backgroundColor = "#5499C7";
}

function basis() {
	document.getElementById("but" + activeButton).className = "sideButton";
	document.getElementById("but" + activeButton).style.backgroundColor = "#E0E0E0";
	activeButton = 1;
	document.getElementById("but1").className = "activeSideButton";
	document.getElementById("but1").style.backgroundColor = "#5499C7";
}

function back() {
	window.open("../weatherStation.html", "_self");
}