window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

window.onload = function() {
	//document.write("Verbinden met actieve computer server...<br>")
	lastPagesSelected = null;
	connection = new WebSocket('ws://192.168.1.3:4445');
	
	connection.onopen = function() {
		connection.send("Hello#");
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	};
}

function respons(mes) {
	var pieces = mes.split("#");
	if (pieces[0] == "Success") {
		nickname = pieces[1];
		buildPage();
	}
	else {
		document.write("Automatisch inloggen mislukt.<br>");
		var a = document.createElement("a");
		var linkText = document.createTextNode("Terug");
		a.appendChild(linkText);
		a.href = "index.html";
		document.body.appendChild(a);
	}
}

function buildPage() {
	//document.write("pagina bouwen...");
}

function mouseOverFirstName() {
	var tag = document.getElementById("firstNameButton");
	tag.style.color = "darkgrey";
}

function mouseOutFirstName() {
	var tag = document.getElementById("firstNameButton");
	tag.style.color = "#E0E0E0";
}

function mouseEnterTrans(element) {
	element.style.backgroundColor = "#E0E0E0";
}

function mouseOutTrans(element) {
	element.style.backgroundColor = "transparent";
}

function mouseOverNickname(el) {
	el.style.color = "#E68A00";
}

function mouseOutNickname(el) {
	el.style.color = "darkred";
}

function mouseOverNicknameS(el) {
	el.style.color = "E68A00";
}

function mouseOutNicknameS(el) {
	el.style.color = "black";
}

function mouseOverInfo(el) {
	el.style.backgroundColor = "#FFCCCC";
	var adj = document.getElementById("adjustPic");
	adj.style.visibility = "visible";
}

function mouseOutInfo(el) {
	el.style.backgroundColor = "#E0E0E0";
	var adj = document.getElementById("adjustPic");
	adj.style.visibility = "hidden";
}

function selectPrintFile(el) {
	var file = el.value;
	file = file.split("\\");
	file = file[file.length - 1];
	//file = file.split("/");
	//file = file[file.lingth - 1];
	var writer = document.getElementById("printedDocumentLink");
	writer.textContent = file;
	writer.style.color = "darkred";
	
	el = document.getElementById("printDocument");
	var file1 = el.files[0];
	
	var ie = new FileReader();
	ie.onload = function() {
		result = new Uint8Array(ie.result);
		//document.write(result);
		document.write(result.length);
		connectServer();
	}
	ie.readAsArrayBuffer(file1);
	
	function connectServer() {
		document.write("Verbinden met server...<br>");
		connection = new WebSocket('ws://192.168.1.3:4446');

	    connection.onopen = function () {
	    document.write("verzonden");
	    connection.send(bin2String(result));
	    };

	    // Log errors
	    connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	    };

	    // Log messages from the server
	    connection.onmessage = function (e) {
	    document.write(e.data);
	    };
	}
	
	
	
//	fr = new FileReader();
//    fr.onload = receivedText;
//    fr.readAsText(file1);
//    
//    function receivedText() {
//        showResult(fr, "Text");
//
//        fr = new FileReader();
//        fr.onload = receivedBinary;
//        fr.readAsBinaryString(file1);
//    }
//
//    function receivedBinary() {
//        showResult(fr, "Binary");
//    }
}

//
//function showResult(fr, label) {
//    var markup, result, n, aByte, byteStr;
//
//    markup = [];
//    result = fr.result;
//    for (n = 0; n < result.length; ++n) {
//        aByte = result.charCodeAt(n);
//        byteStr = aByte.toString(16);
//        if (byteStr.length < 2) {
//            byteStr = "0" + byteStr;
//        }
//        markup.push(byteStr);
//    }
//    bodyAppend("p", label + " (" + result.length + "):");
//    bodyAppend("pre", markup.join(" "));
//}

//function bodyAppend(tagName, innerHTML) {
//    var elm;
//
//    elm = document.createElement(tagName);
//    elm.innerHTML = innerHTML;
//    document.body.appendChild(elm);
//}
//

function pagesAll() {
	if (lastPagesSelected == null) {
		lastPagesSelected = document.getElementById("pagesAll");
	}
	lastPagesSelected.style.backgroundColor = "";
	lastPagesSelected.style.color = "";
	lastPagesSelected = document.getElementById("pagesAll");
	lastPagesSelected.style.backgroundColor = "#E0E0E0";
	lastPagesSelected.style.color = "darkred";
}

function pagesSelected() {	
	if (lastPagesSelected == null) {
		lastPagesSelected = document.getElementById("pagesAll");
	}
	lastPagesSelected.style.backgroundColor = "";
	lastPagesSelected.style.color = "";
	lastPagesSelected = document.getElementById("pagesSelected");
	lastPagesSelected.style.backgroundColor = "#E0E0E0";
	lastPagesSelected.style.color = "darkred";
}

function pagesRange() {
	if (lastPagesSelected == null) {
		lastPagesSelected = document.getElementById("pagesAll");
	}
	lastPagesSelected.style.backgroundColor = "";
	lastPagesSelected.style.color = "";
	lastPagesSelected = document.getElementById("pagesRange");
	lastPagesSelected.style.backgroundColor = "#E0E0E0";
	lastPagesSelected.style.color = "darkred";
}

function bin2String(array) {
	var result = "";
	for (var i = 0; i < array.length; i++) {
		var str = array[i].toString();
		if (str.length == 2) {
			str = "0" + str;
		}
		else if (str.length == 1) {
			str = "00" + str;
		}
		result = result + str;
	}
	return result;
}

function string2Bin(str) {
	var result = [];
	for (var i = 0; i < str.length; i++) {
		result.push(str.charCodeAt(i).toString(8));
	}
	return result;
}























