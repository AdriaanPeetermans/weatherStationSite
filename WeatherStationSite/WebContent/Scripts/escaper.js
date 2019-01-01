window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
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
function unEscape(string) {
	var out = "";
	var i = 0;
	while (i < string.length) {
		if (string.charAt(i) == "%".charAt(0)) {
			i ++;
			//Spatie
			if (string.charAt(i) == "S".charAt(0)) {
				out = out + " ";
			}
			//#
			else if (string.charAt(i) == "N".charAt(0)) {
				out = out + "#";
			}
			//Moet % zijn
			else {
				out = out + "%";
			}
		}
		//Geen probleem
		else {
			out = out + string.substring(i, i + 1);
		}
		i ++;
	}
	return out;
}