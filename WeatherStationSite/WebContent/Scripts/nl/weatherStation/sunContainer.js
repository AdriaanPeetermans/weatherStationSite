window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

window.onload = function() {
	//loadGraph();
}

var activeGraps = [1,0,0];

function mouseEnterGraphType(element) {
	element.style.color = "darkred";
}

function mouseOutGraphType(element) {
	element.style.color = "black";
}

function graphTypeClick(element) {
	var sum = activeGraps.reduce(function(a, b) { return a + b; }, 0);
	var activeGraphsInt = parseInt(element.id[2]);
	if (activeGraps[activeGraphsInt]) {
		return;
	}
	for (var i = 0; i < 3; i++) {
		if (i == activeGraphsInt) {
			activeGraps[i] = 1;
		}
		else {
			activeGraps[i] = 0
		}
		var graphElement = document.getElementById("gt" + i);
		var borderWidth = 3*activeGraps[i];
		graphElement.style.borderBottom = borderWidth+"px solid darkred";
	}
	loadFrame(activeGraphsInt);
}

function loadFrame(frameNumber) {
	var frameHTML = "";
	switch (frameNumber) {
		case 0:
			frameHTML = "sunDay.html";
			break;
		case 1:
			frameHTML = "sunYear.html";
			break;
		case 2:
			frameHTML = "sunPosition.html";
			break;
	}
	var sunFrame = document.getElementById("sunFrame");
	sunFrame.src = frameHTML;
}

//function loadGraph() {
//	var frame = document.getElementById('graph');
//	frame.contentWindow.postMessage(array2Str(activeGraps), '*');
//}

function array2Str(array) {
	var st = "";
	for (var i = 0; i < array.length; i++) {
		st = st + array[i] + "#";
	}
	return st;
}