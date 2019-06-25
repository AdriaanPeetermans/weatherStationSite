window.onerror = function(msg, url, line) {
	var urlstr = "<a href = " + url + ">" + url + "</a>";
	var str = "";
	str = str + "ERROR".fontcolor("red") + "<br>";
	str = str + msg + "<br>";
	str = str + "in : ".fontcolor("red") + urlstr + " line : ".fontcolor("red") + line;
	document.write(str);
}

window.onresize = function(e) {
	document.getElementById("leftBox").style.width = window.innerWidth-540 + "px";
}

window.onload = function() {
	var homePosition = ol.proj.fromLonLat([5.080616, 51.069664]);
	
	document.getElementById("leftBox").style.width = window.innerWidth-540 + "px";
	
	document.getElementById("CO").innerHTML = "N 51.070<br>O 5.081";

	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		projection: 'EPSG:4326',
	});

	var pointFeature = new ol.Feature(new ol.geom.Point(homePosition));

	/**
	 * @constructor
	 * @extends {module:ol/interaction/Pointer}
	 */
	var Drag = (function (PointerInteraction) {
		function Drag() {
			PointerInteraction.call(this, {
				handleDownEvent: handleDownEvent,
				handleDragEvent: handleDragEvent,
				handleMoveEvent: handleMoveEvent,
				handleUpEvent: handleUpEvent
			});
			
			/**
			 * @type {module:ol/pixel~Pixel}
			 * @private
			 */
			this.coordinate_ = null;
		
			/**
			 * @type {string|undefined}
			 * @private
			 */
			this.cursor_ = 'pointer';
		
			/**
			 * @type {module:ol/Feature~Feature}
			 * @private
			 */
			this.feature_ = null;
		
			/**
			 * @type {string|undefined}
			 * @private
			 */
			    this.previousCursor_ = undefined;
		}
		
		if ( PointerInteraction ) Drag.__proto__ = PointerInteraction;
		Drag.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
		Drag.prototype.constructor = Drag;

		return Drag;
	}(ol.interaction.Pointer));


	/**
	 * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt Map browser event.
	 * @return {boolean} `true` to start the drag sequence.
	 */
	function handleDownEvent(evt) {
		var map = evt.map;

		var feature = map.forEachFeatureAtPixel(evt.pixel,
			function(feature) {
				return feature;
			});

			if (feature) {
				this.coordinate_ = evt.coordinate;
				this.feature_ = feature;
			}
		return !!feature;
	}


	/**
	 * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt Map browser event.
	 */
	function handleDragEvent(evt) {
		var deltaX = evt.coordinate[0] - this.coordinate_[0];
		var deltaY = evt.coordinate[1] - this.coordinate_[1];

		var geometry = this.feature_.getGeometry();
		geometry.translate(deltaX, deltaY);

		this.coordinate_[0] = evt.coordinate[0];
		this.coordinate_[1] = evt.coordinate[1];
		var NL = "N";
		var OL = "O";
		var coord = ol.proj.toLonLat(this.coordinate_);
		if (coord[1] < 0) {
			NL = "Z";
			coord[1] = -coord[1];
		}
		if (coord[0] < 0) {
			OL = "W";
			coord[0] = -coord[0];
		}
		document.getElementById("CO").innerHTML = NL + " " + extendString(coord[1],6) + "<br>" + OL + " " + extendString(coord[0],6);
		drawPositionCan(ol.proj.toLonLat(this.coordinate_));
	}
	
	/*
	 * Width: 400, height: 200
	 */
	function drawPositionCan(coord) {
		var graphWidth = 350;
		var graphHeight = 150;
		var canWidth = 400;
		var canHeight = 200;
		var xMarg = 0;
		var yMarg = 0.1;
		var startX = canWidth-graphWidth;
		var startY = canHeight-graphHeight;
		graphWidth = graphWidth*(1-xMarg);
		graphHeight = graphHeight*(1-yMarg);
		var points = getDayLengthPoints(coord);
		if (points.length <= 0) {
			return;
		}
		var minMax = getMinMax(points);
		var c = document.getElementById("positionCan");
		var ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.beginPath();
		var prevxi = Math.round(startX + (points[0][0]-minMax[0])/(minMax[1]-minMax[0])*graphWidth);
		var prevyi = Math.round(startY + (points[0][1]-minMax[2])/(minMax[3]-minMax[2])*graphHeight);
		ctx.moveTo(prevxi, canHeight-prevyi);
		for (var i = 1; i < points.length; i++) {
			var xi = Math.round(startX + (points[i][0]-minMax[0])/(minMax[1]-minMax[0])*graphWidth);
			var yi = Math.round(startY + (points[i][1]-minMax[2])/(minMax[3]-minMax[2])*graphHeight);
			ctx.lineTo(xi, canHeight-yi);
			ctx.stroke();
		}
		
	}
	
	function getMinMax(points) {
		if (points.length <= 0) {
			return null;
		}
		var minX = points[0][0];
		var maxX = points[0][0];
		var minY = points[0][1];
		var maxY = points[0][1];
		for (var i = 0; i < points.length; i++) {
			if (points[i][0] < minX) {
				minX = points[i][0];
			}
			if (points[i][0] > maxX) {
				maxX = points[i][0];
			}
			if (points[i][1] < minY) {
				minY = points[i][1];
			}
			if (points[i][1] > maxY) {
				maxY = points[i][1];
			}
		}
		return [minX, maxX, minY, maxY];	
	}
	
	function getDayLengthPoints(coord) {
		var result = [];
		for (var i = 0; i < 365; i++) {
			var gamma = 2*Math.PI/365*i;
			var eqtime = 229.18*(0.000075 + 0.001868*Math.cos(gamma) - 0.032077*Math.sin(gamma) - 0.014615*Math.cos(2*gamma) - 0.040849*Math.sin(2*gamma));
			var decl = 0.006918 - 0.399912*Math.cos(gamma) + 0.070257*Math.sin(gamma) - 0.006758*Math.cos(2*gamma) + 0.000907*Math.sin(2*gamma) - 0.002697*Math.cos(3*gamma) + 0.00148*Math.sin (3*gamma);
			var ha = Math.acos((Math.cos(90.833/180*Math.PI))/(Math.cos(coord[1]/180*Math.PI)*Math.cos(decl))-Math.tan(coord[1]/180*Math.PI)*Math.tan(decl));
			var suntime = 2*ha/Math.PI*180*24/360;
			if (isNaN(suntime)) {
				if (i < 80) {
					suntime = 0;
				}
				else if (i < 264) {
					suntime = 24;
				}
				else {
					suntime = 0;
				}
				if (coord[1] < 0) {
					suntime = 24-suntime;
				}
			}
			result.push([i,suntime]);
		}
		return result;
	}
	
	function extendString(num, len) {
		var result = "" + num;
		while (result.length < len) {
			result = "0" + result;
		}
		if (result.length > len) {
			result = result.substring(0, len);
		}
		return result;
	}


	/**
	 * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt Event.
	 */
	function handleMoveEvent(evt) {
		if (this.cursor_) {
			var map = evt.map;
			var feature = map.forEachFeatureAtPixel(evt.pixel,
				function(feature) {
					return feature;
				});
			var element = evt.map.getTargetElement();
			if (feature) {
				if (element.style.cursor != this.cursor_) {
					this.previousCursor_ = element.style.cursor;
					element.style.cursor = this.cursor_;
				}
			}
			else if (this.previousCursor_ !== undefined) {
				element.style.cursor = this.previousCursor_;
				this.previousCursor_ = undefined;
			}
		}
	}


	/**
	 * @return {boolean} `false` to stop the drag sequence.
	 */
	function handleUpEvent() {
		this.coordinate_ = null;
		this.feature_ = null;
		window.alert("klaar!");
		return false;
	}

	var map = new ol.Map({
		interactions: ol.interaction.defaults().extend([new Drag()]),
		controls: ol.control.defaults().extend([mousePositionControl]),
		target: 'mapContainer',
		layers: [
	         new ol.layer.Tile({
	        	 source: new ol.source.OSM()
	         }),
	         new ol.layer.Vector({
	        	 source: new ol.source.Vector({
	        		 features: [pointFeature]
	        	 }),
	        	 style: new ol.style.Style({
	        		 image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
	        			 anchor: [0.5, 1],
	        			 anchorXUnits: 'fraction',
	        			 anchorYUnits: 'fraction',
	        			 opacity: 0.8,
	        			 src: '../../../Images/weatherStation/marker.png'
	        		 }))
	        	 })
	         })
	         ],
	    view: new ol.View({
	    	center: homePosition,
	    	zoom: 4
	    })
	});
}