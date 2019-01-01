window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

function createAccount() {
	nicknameText = document.getElementById("nickname");
	passwordText1 = document.getElementById("password1");
	passwordText2 = document.getElementById("password2");
	if (passwordText1.value != passwordText2.value) {
		var fout = document.createTextNode("Wachtwoorden niet hetzelfde.");
		document.body.appendChild(fout);
		return;
	}
	connectServer();
}

function connectServer() {
	document.write("Verbinden met server...<br>");
	connection = new WebSocket('ws://127.0.0.1:4444');

    connection.onopen = function () {
    createAccount2();
    };

    // Log errors
    connection.onerror = function (error) {
    document.write('WebSocket Error ' + error + "<br>");
    };

    // Log messages from the server
    connection.onmessage = function (e) {
    respons(e.data);
    };
}

function createAccount2() {
	connection.send("AddUser#" + escape(nicknameText.value) + "#" + escape(passwordText1.value));
}

function respons(mes) {	
	if (mes == "Success") {
		document.write("Aanmaken succes!<br />");
	}
	else {
		document.write("Aanmaken mislukt.<br />");
	}
	var a = document.createElement("a");
	var linkText = document.createTextNode("Terug");
	a.appendChild(linkText);
	a.href = "index.html";
	document.body.appendChild(a);
}

function escape(string) {
	var out = "";
	for (var i = 0; i < string.length; i ++) {
		//Spatie = %S
		if (string.charAt(i) == " ".charAt(0)) {
			out = out + "%S";
		}
		//# = %N
		else if (string.charAt(i) == "#".charAt(0)) {
			out = out + "%N";
		}
		//% = %%
		else if (string.charAt(i) == "%".charAt(0)) {
			out = out + "%%";
		}
		//Geen probleem
		else {
			out = out + string.substring(i, i + 1);
		}
	}
	return out;
}