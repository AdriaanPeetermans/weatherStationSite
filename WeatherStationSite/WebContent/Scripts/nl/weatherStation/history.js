window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

window.onload = function() {
	loadGraph();
}

var activeGraps = [1,0,0,0,0,0];

function mouseEnterGraphType(element) {
	element.style.color = "darkred";
}

function mouseOutGraphType(element) {
	element.style.color = "black";
}

function graphTypeClick(element) {
	var sum = activeGraps.reduce(function(a, b) { return a + b; }, 0);
	var activeGraphsInt = parseInt(element.id[2]);
	if ((sum == 1) && (activeGraps[activeGraphsInt])) {
		return;
	}
	activeGraps[activeGraphsInt] = !activeGraps[activeGraphsInt]*1;
	var borderWidth = 3*activeGraps[activeGraphsInt];
	element.style.borderBottom = borderWidth+"px solid darkred";
	loadGraph();
}

function loadGraph() {
	var frame = document.getElementById('graph');
	frame.contentWindow.postMessage(array2Str(activeGraps), '*');
}

function array2Str(array) {
	var st = "";
	for (var i = 0; i < array.length; i++) {
		st = st + array[i] + "#";
	}
	return st;
}