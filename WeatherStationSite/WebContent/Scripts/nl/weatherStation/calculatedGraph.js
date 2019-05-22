window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

var Graphs;

var activeGraphType = [1, 0, 0, 0];

var graphNames = ["Maximum temperatuur", "Minimum temperatuur", "Zon op", "Zon weg"];

var graphColors = ['rgba(245, 176, 65, 1)', 'rgba(118, 215, 196, 1)', 'rgba(229, 152, 102, 1)', 'rgba(36, 113, 163, 1)'];

var graphBackColors = ['rgba(245, 176, 65, 0.2)', 'rgba(118, 215, 196, 0.2)', 'rgba(229, 152, 102, 0.2)', 'rgba(36, 113, 163, 0.2)'];

var pointColors = ['rgba(231, 76, 60, 1)', 'rgba(46, 134, 193, 1)', 'rgba(229, 152, 102, 1)', 'rgba(36, 113, 163, 1)'];

var myChart;

var connection;

var serverAddress = 'ws://127.0.0.1:9876';
//var serverAddress = 'ws://192.168.1.3:9876';

var periodLength = 1;

var whichPeriod = 2;

var minutePeriod = 24*60;

var startMinute = 1;

var tryNextDataB = false;

var tryNextDataS1 = false;

var firstDayDate;

window.onload = function() {
	//document.getElementById("iets").innerHTML = "Type: "+;
	
	//connection = new WebSocket('ws://192.168.1.8:9876');
	connection = new WebSocket(serverAddress);
	
	connection.onopen = function() {
		connection.send("1#"+periodLength+"#"+whichPeriod+"#"+minutePeriod+"#"+startMinute);
	};
	
	connection.onerror = function (error) {
		window.alert("calculatedGraph");
		console.log(error);
	    //document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	    buildGraph();
	};
}

window.addEventListener('message', function(event) {
	activeGraphType = str2Array(event.data);
	adjustGraph();
}); 

function respons(mes) {
	var parts = mes.split("#");
	var periodName = parts[0];
	document.getElementById("periodName").innerHTML = periodName;
	var dayString = parts[1];
	firstDayDate = moment(dayString);
	var numberGraphs = parseInt(parts[2]);
	var graphDatas = [];
	var index = 3;
	for (var i = 0; i < numberGraphs; i++) {
		var graphName = parts[index];
		var numberPoints = parts[index+1];
		var points = parts[index+2];
		points = points.split(",");
		var tempMax = [];
		var tempMin = [];
		var sunUp = [];
		var sunDown = [];
		for (var j = 0; j < numberPoints; j++) {
			switch (i) {
				case 0:
					tempMax.push(parseFloat(points[j*2]));
					tempMin.push(parseFloat(points[j*2+1]));
				break;
				case 1:
					tempMax.push(parseFloat(points[j*4]));
					tempMin.push(parseFloat(points[j*4+1]));
					sunUp.push(points[j*4+2]);
					sunDown.push(points[j*4+3]);
				break;
			}
		}
		var graphData = {name:graphName, length:numberPoints, tempMax:tempMax, tempMin:tempMin, sunUp:sunUp, sunDown:sunDown};
		graphDatas.push(graphData);
		index = index + 3
	}
	Graphs = {name:periodName, number:numberGraphs, graph:graphDatas};
}

function buildGraph() {
	//xData in uren zetten:
	//window.alert(Graphs.graph[0].xData.length);
	//var ofset = Graphs.graph[0].xData[0];
	
	
	
	var time = [];
	var currentMin = startMinute;
	for (var i = 0; i < Graphs.graph[1].tempMax.length; i++) {
		time.push(currentMin);
		currentMin = currentMin + minutePeriod;
	}
	var ctx = document.getElementById("myChart").getContext('2d');
	myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        //labels: ["1", "2", "3", "4", "6", "7"],
	    	//labels: time,
//	        datasets: [{
//	            label: Graphs.graph[1].name + " temperature",
//	            data: generateData(Graphs.graph[1].temp, generateTime(Graphs.graph[1].temp.length)),
//	            backgroundColor: 'rgba(93, 173, 226, 0.5)',
//	            borderColor: 'rgba(93, 173, 226,1)',
//	            borderWidth: 3,
//	            pointRadius: 0
//	        },
//	        {
//	        	label: Graphs.graph[0].name + " temperature",
//	            data: generateData(Graphs.graph[0].temp, generateTime(Graphs.graph[0].temp.length)),
//	            backgroundColor: 'rgba(125, 206, 160, 0.5)',
//	            borderColor: 'rgba(125, 206, 160,1)',
//	            borderWidth: 3,
//	            pointRadius: 0
//	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        },
	        elements: {
	            line: {
	                tension: 0.2, // disables bezier curves
	            }
	        }
	    }
	});
	adjustGraph();
	document.getElementById("myChart").style.width = 1044;
}

function adjustGraph() {
	if (myChart != undefined) {
//		var time = [];
//		var currentMin = startMinute;
//		for (var i = 0; i < Graphs.graph[1].temp.length; i++) {
//			time.push(currentMin);
//			currentMin = currentMin + minutePeriod;
//		}
		var time = generateTime(Graphs.graph[1].tempMax.length);
		var dataSet = [];
		var yAxes = [];
		var xUnit;
		var pointRadius;
		var pointHitRadius;
		switch (periodLength) {
			case 1:
				xUnit = 'day';
				pointRadius = 6;
				pointHitRadius = 10;
				break;
			case 2:
				xUnit = 'day';
				pointRadius = 2;
				break;
			case 3:
			case 4:
				xUnit = 'month';
				pointRadius = 0;
				break;
		}
		var xAxes = [{
			type: 'time',
			display: true,
			scaleLabel: {
				display: true,
				labelString: 'Tijd'
			},
			time: {
				unit: xUnit,
				displayFormats: {
                    hour: 'HH:mm',
                    day: 'DD MMM',
                    month: 'MMM YYYY'
                }
            },
			id: "xAxes"
		}];
		for (var i = 0; i < activeGraphType.length; i++) {
			if (activeGraphType[i]) {
				var data;
				var axesID;
				var yAxisName;
				var yAx;
				switch (i) {
					case 0:
					case 1:
						switch (i) {
							case 0:
								data = Graphs.graph[1].tempMax;
								break;
							case 1:
								data = Graphs.graph[1].tempMin;
								break;
						}
						axesID = "yAxis-Te";
						yAxisName = "Temperatuur [°C]";
						yAx = {
							type: 'linear',
							display: true,
							position: 'left',
							id: axesID,
							gridLines: {drawOnChartArea: false},
							scaleLabel: {
								display: true,
								labelString: yAxisName
							}
						};
						break;
					case 2:
					case 3:
						var datas;
						switch (i) {
							case 2:
								datas = Graphs.graph[1].sunUp;
								break;
							case 3:
								datas = Graphs.graph[1].sunDown;
								break;
						}
						data = [];
						for (var j = 0; j < datas.length; j++) {
							if (datas[j] == "*") {
								data.push(null);
								continue;
							}
//							var ti = firstDayDate.clone();
//							ti.add(parseInt(datas[j].substring(0,2)), 'H');
//							ti.add(parseInt(datas[j].substring(2,4)), 'm')
							data.push(parseInt(datas[j].substring(0,2))+parseInt(datas[j].substring(2,4))/60.0);
						}
						axesID = "yAxis-Ti";
						yAxisName = "Tijd";
						yAx = {
							type: 'linear',
							display: true,
							position: 'left',
							id: axesID,
							gridLines: {drawOnChartArea: false},
							scaleLabel: {
								display: true,
								labelString: yAxisName
							},
//							time: {
//								min: firstDayDate.clone(),
//								max: firstDayDate.clone().add(24, 'H'),
//								unit: 'hour',
//								displayFormats: {
//				                    hour: 'HH:mm',
//				                    day: 'DD MMM',
//				                    month: 'MMM YYYY'
//				                }
//				            },
							ticks: {
			                    beginAtZero: false,
			                    reverse: false
			                }
						};
						break;
				}
				if (((i != 1) || (!activeGraphType[0])) && ((i != 3) || (!activeGraphType[2]))) {
					yAxes.push(yAx);
				}
				if ((data.length != 0) && ((document.getElementById("sensor1On").checked) || tryNextDataS1)) {
					var graphItem = {
							label: Graphs.graph[1].name + " " + graphNames[i],
							data: generateData(data, time),
							backgroundColor: graphBackColors[i],
							borderColor: graphColors[i],
							borderWidth: 3,
							pointRadius: pointRadius,
							pointBackgroundColor: pointColors[i],
							pointBorderColor: pointColors[i],
							yAxisID: axesID,
							//xAxisID: "xAxes"
					}
					dataSet.push(graphItem);
					document.getElementById("sensor1On").checked = true;
					tryNextDataS1 = false;
				}
				else {
					if ((data.length == 0) && (!document.getElementById("basisOn").checked)) {
						tryNextDataS1 = true;
					}
					document.getElementById("sensor1On").checked = false;
				}
				if (i < 2) {
					switch(i) {
						case 0:
							data = Graphs.graph[0].tempMax;
							break;
						case 1:
							data = Graphs.graph[0].tempMin;
							break;
					}
					if ((data.length != 0) && ((document.getElementById("basisOn").checked) || tryNextDataB)) {
						graphItem = {
								label: Graphs.graph[0].name + " " + graphNames[i],
								data: generateData(data, time),
								backgroundColor: graphBackColors[i],
								borderColor: graphColors[i],
								borderWidth: 3,
								pointRadius: pointRadius,
								pointBackgroundColor: pointColors[i],
								pointBorderColor: pointColors[i],
								yAxisID: axesID,
								//xAxisID: "xAxes"
						}
						dataSet.push(graphItem);
						document.getElementById("basisOn").checked = true;
						tryNextDataB = false;
					}
					else {
						if ((data.length == 0) && (!document.getElementById("basisOn").checked)) {
							tryNextDataB = true;
						}
						document.getElementById("basisOn").checked = false;
					}
				}
			}
		}
		myChart.options.scales.xAxes = xAxes;
		myChart.options.scales.yAxes = yAxes;
		//myChart.data.labels = time;
		myChart.data.datasets = dataSet;
		myChart.update();
	}
}

function generateTime(length) {
	var result = [];
	var ti = firstDayDate.clone();
	ti.add(startMinute, 'm');
	for (var i = 0; i < length; i++) {
		result.push(ti.format());
		ti.add(minutePeriod, 'm');
	}
	return result;
}

function generateData(data, time) {
	var result = [];
	for (var i = 0; i < data.length; i++) {
		var point = {
			x: time[i],
			y: data[i]
		}
		result.push(point);
	}
	return result;
}

function loadNewData() {
	connection.close();
	connection = new WebSocket(serverAddress);
	
	connection.onopen = function() {
		connection.send("1#"+periodLength+"#"+whichPeriod+"#"+minutePeriod+"#"+startMinute);
	};
	
	connection.onerror = function (error) {
	    document.write('WebSocket Error ' + error + "<br>");
	};
	
	connection.onmessage = function (e) {
	    respons(e.data);
	    adjustGraph();
	};
}

function changePeriod(el) {
	periodLength = el.selectedIndex + 1;
	switch (periodLength) {
		case 1:
			minutePeriod = 24*60;
			startMinute = 1;
			break;
		case 2:
			minutePeriod = 24*60;
			startMinute = 1;
			break;
		case 3:
		case 4:
			minutePeriod = 24*60;
			startMinute = 1;
			break;
	}
	loadNewData();
}

function changeDate(dir) {
	whichPeriod = whichPeriod - dir;
	loadNewData();
}

function mouseOverArrow(el, ar) {
	if (ar == 1) {
		ar = "Right";
	}
	else {
		ar = "Left";
	}
	el.src = "../../../Images/graphArrow"+ar+".png";
}

function mouseOutArrow(el, ar) {
	if (ar == 1) {
		ar = "Right";
	}
	else {
		ar = "Left";
	}
	el.src = "../../../Images/graphArrow"+ar+"Sel.png";
}

function checkBasis() {
	adjustGraph();
}

function checkSensor1() {
	adjustGraph();
}

function str2Array(str) {
	ar = [];
	ars = str.split("#");
	for (var i = 0; i < ars.length-1; i++) {
		ar.push(parseInt(ars[i]));
	}
	return ar;
}

function getParamValue(paramName) {
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++) 
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName) 
            return pArr[1]; //return value
    }
}