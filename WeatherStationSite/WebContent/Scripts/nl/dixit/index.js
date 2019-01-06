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
}

function newGame() {
	window.open("newGame.html", "_self");
}

function join() {
	window.open("joinGame.html", "_self");
}

function mouseIn(el) {
	el.style.color = "#EBEDEF";
}

function mouseOut(el) {
	el.style.color = "#2C3E50";
}