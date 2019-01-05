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

var bottomAnimatorInterval;

function init() {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	bottomAnimatorInterval = window.setInterval(bottomAnimator, frameDur);
}

var fps = 60;				//Frames/second
var butAnimTime = 0.5;		//Seconds

var frameDur = Math.floor(1000/fps);
var leftButtonSize = 50;
var rightButtonSize = 50;
var nbFrames = Math.round(butAnimTime*1000/frameDur);
var animIndex = 0;
var stepSize = 50/nbFrames;

function bottomAnimator() {
	if (animIndex == 0) {
		document.getElementById("leftButtonholder").innerHTML = "";
		document.getElementById("rightButtonHolder").innerHTML = "";
	}
	if (animIndex < nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = leftButtonSize + "%";
		rightButton.style.width = rightButtonSize + "%";
		leftButtonSize = leftButtonSize - stepSize;
		rightButtonSize = rightButtonSize + stepSize;
		animIndex = animIndex + 1;
		return;
	}
	if (animIndex == nbFrames) {
		var leftButton = document.getElementById("leftButtonBlock");
		var rightButton = document.getElementById("rightButtonBlock");
		leftButton.style.width = "0%";
		rightButton.style.width = "100%";
		var rightButtonHolder = document.getElementById("rightButtonHolder");
		rightButtonHolder.innerHTML = "Code: 1A2B3C";
		animIndex = animIndex + 1;
		rightButtonHolder.style.borderBottomLeftRadius = "6px";
		rightButtonHolder.style.borderTopLeftRadius = "0px";
		window.clearInterval(bottomAnimatorInterval);
	}
}