function init() {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	document.getElementById("mainBlock").style.width = window.innerWidth-300 + "px";
	getFiles();
}

window.onresize = function(e) {
	document.getElementById("mainBlock").style.height = window.innerHeight-70 + "px";
	document.getElementById("mainBlock").style.width = window.innerWidth-300 + "px";
}

var connection;
var serverAddress = 'ws://127.0.0.1:9002';
//var serverAddress = 'ws://192.168.1.3:9002';

var path = "database";

function getFiles() {
	connection = new WebSocket(serverAddress);
	
	connection.onopen = function() {
		connection.send("0#" + path);
	};
	
	connection.onerror = function (error) {
		console.log(error);
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	};
}

var folders;

function respons(mes) {
	var parts = mes.split("#");
	var responsType = parseInt(parts[0]);
	var number = parseInt(parts[1]);
	var mainBlock = document.getElementById("mainBlock");
	mainBlock.innerHTML = "";
	switch (responsType) {
		case 0:
			folders = [];
			for (var i = 0; i < number; i++) {
				var type = parseInt(parts[i*3+2]);
				var name = parts[i*3+4];
				var size = parts[i*3+3];
				folders.push({type:type, name:name});
				var imageName = "file";
				if (type == 0) {
					imageName = "folder";
				}
				mainBlock.innerHTML = mainBlock.innerHTML + "<div class=\"fileFolder\" id=\"fileFolder_" + name + "\" ondblclick=\"fileFolderEnter(this)\" onmouseenter=\"mouseEnterFF(this)\" onmouseleave=\"mouseLeaveFF(this)\" onclick=\"mouseClickFF(" + i + ")\">" +
						"<div class=\"checkBox\">" +
						"<input type=\"checkbox\" name=\"fileCheck\" id=\"checkBox_" + i + "\"></div>" +
						"<div class=\"fileFolderPict\">" +
						"<img src = \"../../../Images/" + imageName + ".png\" height=\"30px\"></div>" +
						"<div class=\"fileFolderName\">" + name + "</div>" +
						"<div class=\"onDisk\">Ja</div></div>";
			}
			mainBlock.style.height = number*31 + "px";
			document.getElementById("path").innerHTML = path;
			document.getElementById("legendSpacer").style.borderBottomWidth = "1px";
			document.getElementById("legend").style.display = "block";
			document.getElementById("downloadButton").style.display = "block";
			document.getElementById("downloadButton").style.display = "flex";
			break;
		case 1:
			mainBlock.innerHTML = "<div class=\"fileTop\">" +
					"<div class=\"fileDownloadContainer\">" +
					"<div class=\"fileDownloadButton\" onclick=\"fileDownload()\" onmouseout=\"mouseOutFileDownload(this)\" onmouseover=\"mouseInFileDownload(this)\">Download</div>" +
					"</div><div class=\"fileDataContainer\">" + number + " lijnen | " + parseInt(parts[2])/1000 + " kB</div>" +
					"<div class=\"fileButtonsContainerRight\">" +
					"<div class=\"fileButtonRight\" onclick=\"fileSelect()\" onmouseout=\"mouseOutFileBut(this)\" onmouseover=\"mouseInFileBut(this)\">Selecteer</div></div>" +
					"<div class=\"fileButtonsContainerLeft\">" +
					"<div class=\"fileButtonLeft\" onclick=\"fileCopy()\" onmouseout=\"mouseOutFileBut(this)\" onmouseover=\"mouseInFileBut(this)\">Kopieer</div>" +
					"</div>" +
					"</div>" +
					"<div id=\"fileLineNumberContainer\"></div>" +
					"<div id=\"fileContainer\"></div>";
			var fileContainer = document.getElementById("fileContainer");
			var lineContainer = document.getElementById("fileLineNumberContainer");
			fileContainer.innerHTML = "";
			lineContainer.innerHTML = "";
			for (var i = 0; i < number; i++) {
				fileContainer.innerHTML = fileContainer.innerHTML + parts[i+3] + "<br>";
				lineContainer.innerHTML = lineContainer.innerHTML + (i+1) + "<br>";
			}
			document.getElementById("path").innerHTML = path;
			document.getElementById("legendSpacer").style.borderBottomWidth = "0px";
			document.getElementById("legend").style.display = "none";
			document.getElementById("downloadButton").style.display = "none";
			mainBlock.style.height = (number*14) + "px";
			lineContainer.style.height = (number*14) + "px";
			break;
	}
}

function fileSelect() {
	var text = document.getElementById("fileContainer");
	if (document.body.createTextRange) {
        var range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
	}
	else if  (window.getSelection) {
		var selection = window.getSelection();            
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
	}
}

function fileCopy() {
	copyTextToClipboard(removeBreaks(document.getElementById("fileContainer").innerHTML));
}

function removeBreaks(text) {
	return text.replace(/<br>/g, "\r\n");
}

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		//window.alert('Fallback: Copying text command was ' + msg);
	} catch (err) {
		window.alert('Fallback: Oops, unable to copy', err);
	}
	document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function() {
		//window.alert('Async: Copying to clipboard was successful!');
	}, function(err) {
		window.alert('Async: Could not copy text: ', err);
	});
}

function mouseOutFileBut(el) {
	el.style.backgroundColor = "#F8F9F9";
}

function mouseInFileBut(el) {
	el.style.backgroundColor = "#F1948A";
}

function fileDownload() {
	
}

function mouseOutFileDownload(el) {
	el.style.backgroundColor = "darkred";
}

function mouseInFileDownload(el) {
	el.style.backgroundColor = "#F1948A";
}

function mouseEnterFF(el) {
	el.style.backgroundColor = "#E0E0E0";
}

function mouseLeaveFF(el) {
	el.style.backgroundColor = "";
}

function mouseClickFF(num) {
	var checkBox = document.getElementById("checkBox_" + num);
	checkBox.checked = !checkBox.checked;
}

function fileFolderEnter(el) {
	folderName = el.id.substring(11);
	var type = getType(folderName);
	path = path + "/" + folderName;
	connection.send(type + "#" + path);
}

function mouseOutDownload(el) {
	el.style.backgroundColor = "darkred";
}

function mouseInDownload(el) {
	el.style.backgroundColor = "#F1948A";
}

function download() {
	
}

function mouseOverPath() {
	var el = document.getElementById("path");
	el.style.backgroundColor = "#F1948A";
	var parts = path.split("/");
	el.innerHTML = "";
	for (var i = 0; i < parts.length; i++) {
		var slash = "";
		if (i != 0) {
			slash = "/";
		}
		el.innerHTML = el.innerHTML + "<div class=\"pathBlock\" onmouseover=\"mouseOverPathBox(this)\" onmouseout=\"mouseOutPathBox(this)\" onclick=\"pathBoxClick(" + i + ")\">" + slash + parts[i] + "</div>";
	}
}

function pathBoxClick(num) {
	var parts = path.split("/");
	if (num == parts.length-1) {
		return;
	}
	var newPath = "";
	for (var i = 0; i <= num; i++) {
		if (i != 0) {
			newPath = newPath + "/";
		}
		newPath = newPath + parts[i];
	}
	path = newPath;
	connection.send("0#" + path);
}

function getType(folderName) {
	for (var i = 0; i < folders.length; i++) {
		if (folders[i].name == folderName) {
			return folders[i].type;
		}
	}
}

function mouseOutPath() {
	var el = document.getElementById("path");
	el.innerHTML = path;
	el.style.backgroundColor = "#E0E0E0";
}

function mouseOverPathBox(el) {
	el.style.color = "#E0E0E0";
}

function mouseOutPathBox(el) {
	el.style.color = "darkred";
}

function calculateTextWidth(text) {
	var test = document.getElementById("test");
	test.innerHTML = text;
	var width = (test.clientWidth + 1) + "px";
	return width;
}