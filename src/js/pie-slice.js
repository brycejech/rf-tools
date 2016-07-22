// TODO //
// - Fix getRadioInfo() && placeMarker, remove string concatenation to build html
// - Rename functions using lower_case_with_underscores
// - Add draw line functionality (will need it for backhauls)
// 		- should have info window on click with info on both backhauls
// - draw_sector() or addRadio() should check if sector exists before adding a new one
//		- google.maps.InfoWindow can take a DOM object as content
// - CREATE add_site(), should take in a tower site and utilize placeMarker
//		- will want to utilize more info from the db when adding site
//			- site_number, location, height, type, range
// - Change on mouseover events to onclick events
//		- too many pop up info windows in close proximity
//		- hover event is jerky when moving in/out of info windows



var pSlice = (function(window, google, undefined){

var x = 0, y= 0;
	//Global Variables
	var towers = {},
		info_windows = [],
		sectors = [],
		EarthRadiusMeters = 6378137.0, // meters
		element = document.getElementById('gmap_canvas'),
		global_z_index = 1;

	// Set up map options 
	var options = {
    		mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			zoom: 10,
			zoomControlOptions: {
	 			style: google.maps.ZoomControlStyle.LARGE,
	 			position: google.maps.ControlPosition.TOP_LEFT
			},
			center: {
				lat: 36.113225,
				lng: -97.058395
			}
		};
	var map = new google.maps.Map(element, options);

	//main function for placing marker(tower location) on map
	function placeMarker(lat, lng, name, height){

		// if(checkTowers(name) == true){
		// 	return;
		// }
		options = {
			map: map,
			name: name,
			height: height,
			position: {
				'lat': lat,
				'lng': lng
			},
		}

		//adds new tower site based on name to towers dictionary
	    towers[name] = new google.maps.Marker(options);

	    //starts tower content info(name, height) to be added to tower info window
	    tower_info = '<div id="content">' +
		    			'<h2 id="name">' + name +'</h1>' + 
		    			'<table name="info">' + 
			    			'<tr>' + 
			    				'<td><b>Height:</b> '+ height + '</td>' + 
			    			'</tr>' + 
			    		'</table>' +
	    			'</div>';
	    //creates new info window to display tower info
	    var info_window = addInfoWindow(name, tower_info);
	    info_windows.push(info_window);
	    //adds mouse over/out events for each tower
	    onInfoWindow_MouseOver(towers[name], info_window);
	    onInfoWindow_MouseOut(towers[name], info_window);
	}


	function checkTowers(name){

		for(var tower in towers){
			if(tower.name == name){
				return true;
			}
		}
		return false;
	}


	//function that draws the arc based on center pt, intial and final bearings(direction), and radius
	function get_arc_points(center, bearing, beamwidth, radius){ 

		var d2r = Math.PI / 180;   // degrees to radians 
		var r2d = 180 / Math.PI;   // radians to degrees 
		var halfBWidth = beamwidth/2;
		var bearingL = bearing - halfBWidth;
		var bearingR = bearing + halfBWidth;
		var num_points = 32; 

		// find the raidus in lat/lon 
		var rlat = (radius / EarthRadiusMeters) * r2d; 
		var rlng = rlat / Math.cos(center.lat() * d2r); 

		var extp = new Array();

		//if (initialBearing > finalBearing) finalBearing += 360;
		var deltaBearing = bearingL - bearingR;
		deltaBearing = deltaBearing/num_points;
		for (var i=0; (i < num_points+1); i++) 
		{ 
			extp.push(DestinationPoint(center, bearingR + i*deltaBearing, radius)); 
			//bounds.extend(extp[extp.length-1]);
		}
		extp.push(center); 
		return extp;
	}


	//function that return new info window containing radio_info(Ap name and freq)
	function getRadioInfo(name, freq, band){

		radio_info = '<div id="content">' +
	    			'<h2 id="radio_name">' + name +'</h1>' + 
	    			'<table name="radio_info">' + 
			    		'<tr><td><b>Freq: </b>' + freq + '</td></tr>' +
						'<tr><td><b>Band: </b> '+ band + '</td></tr>' +
					'</table>' +
	    		'</div>';
		var rad_Window = addInfoWindow(name, radio_info);
		return rad_Window;
	}


	//function creates new polygon based on arcPts
	//links info_windows to polygon at windowPt
	function draw_sector(name, site_name, freq, arcPts, info_window, windowPt){
		
		//Draw sector polygon
		var sector_polygon = new google.maps.Polygon({
				name: name,
				site: site_name,
                paths: [arcPts],
                strokeColor: "#010078",
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: rf.get_color_by_freq(freq),
                fillOpacity: 0.8,
                zIndex: global_z_index,
                map: map
     });

		sectors.push(sector_polygon);
		//info_window.bindTo('map', sector_polygon);
		//adds mouse over/out events for each polygon
		onInfoWindow_MouseOver(sector_polygon, info_window, windowPt);
		onInfoWindow_MouseOut(sector_polygon, info_window, windowPt);
	}


	//function that returns a destination pt based on center coordinates, bearing, and radius
	function DestinationPoint(center, bearing, radius){

		var R = EarthRadiusMeters; // earth's mean radius in meters
		var bearing = toRad(bearing);
		var lat1 = toRad(center.lat()), lon1 = toRad(center.lng());
		var lat2 = Math.asin( Math.sin(lat1)*Math.cos(radius/R) + 
		                      Math.cos(lat1)*Math.sin(radius/R)*Math.cos(bearing) );
		var lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(radius/R)*Math.cos(lat1), 
		                             Math.cos(radius/R)-Math.sin(lat1)*Math.sin(lat2));

		return new google.maps.LatLng(toDeg(lat2), toDeg(lon2));
	}


	//function converts degrees to radians
	function toRad(bearing) {

		return bearing * Math.PI / 180;
	}


	//function converts coordinates to degrees.
	function toDeg(lat) {

		return lat * 180 / Math.PI;
	}


	//function that adds radio info to tower info_window
	//Also creates polygon for radio based on bearing, beamwidth, and radius
	function addRadio(radio){

		
		var center 		= new google.maps.LatLng(parseFloat(radio.lat), parseFloat(radio.lng)),
			azimuth 	= parseFloat(radio.ant_azimuth),
			beamwidth 	= parseFloat(radio.ant_beamwidth),
			// Convert range from miles to meters
			range 		= parseFloat(radio.site_range) * 1609.344
		placeMarker(center.lat(), center.lng(), radio.site_name, radio.site_height);
		
		var arcPts = get_arc_points(center, azimuth, beamwidth, range);


		var info_window = getRadioInfo(radio.device_name, radio.tx_freq, radio.band);

  		var windowPt = DestinationPoint(center, azimuth, range/2);

  		draw_sector(radio.device_name, radio.site_name, radio.tx_freq, arcPts, info_window, windowPt);
	}


	//function for set map center to lat, lng
	function setCenter(lat, lng){

		map.setCenter({
	      'lat': lat,
	      'lng': lng
	    });
	}


	//function that removes tower(name) marker and sectors from the map
	function removeMarker(name){

		count = 0;
		for(var i = 0; i<sectors.length; i++){
			console.log('count is: ' + count)
			console.log(i)
			if(sectors[i].site == name){
				sectors[i].setMap(null);
				sectors.splice(i,1);
				i--;
			}count++;
		}
		towers[name].setMap(null);
		delete towers[name];
	}


	//function to remove a specific sector
	function removeSector(name){

		var siteEmpty = false;
		for(var i = 0; i<sectors.length; i++){
			if(sectors[i].name == name){
				sectors[i].setMap(null);
				sectors.splice(i,1);
			}
		}
		
	}


	//function that returns new info_window containing tower_info
	function addInfoWindow(name, tower_info){

		return new google.maps.InfoWindow({
			name: name,
	    	content: tower_info
	    	});
	}


	//function for adding mouse over event to poly, opening info_window on windowPt
	function onInfoWindow_MouseOver(poly, info_window, windowPt){

		google.maps.event.addListener(poly,'mouseover', function(){
	    	info_window.setPosition(windowPt);
			info_window.open(map, poly);
		});
	}


	//function for adding mouse out event to item, closes info_window
	function onInfoWindow_MouseOut(poly, info_window){

		google.maps.event.addListener(poly,'mouseout', function(){
			info_window.close(map, poly);
		});
	}


	var toggle_sector = function(name){

		for(var i = 0; i < sectors.length; i++){
			if (sectors[i].name == name){
				if(sectors[i].map != null){
					sectors[i].setMap(null)
				}
				else{
					global_z_index++;
					sectors[i].setOptions({zIndex: global_z_index})
					sectors[i].setMap(map)
				}
			}
		}
	}

	return {

		placeMarker: function(lat, lng, name, height){ return placeMarker(lat, lng, name, height) },
		removeMarker: function(name){ return removeMarker(name) },
		removeSector: function(name){ return removeSector(name) },
		addRadio: function(radio){ return addRadio(radio) },
		sectors: function(){ return sectors },
		toggle_sector: function(name){ return toggle_sector(name) }
	}	
})(window, google, undefined);





// Test data

// var r = {
// 		name: 'testAp',
// 		site: 'pvn',
// 		freq: 2400,
// 		band: 2.5,
// 		bearing: 160,
// 		beamwidth: 90,
// 		radius: 10*1609.34 };
// var testRadio = {
// 		name: 'testAp2',
// 		site: 'pvn',
// 		freq: 2675,
// 		band: 5.8,
// 		bearing: 300,
// 		beamwidth: 90,
// 		radius: 10*1609.34 
// 		};
// var center = new google.maps.LatLng(36.113225, -97.058395);
// var x = {
// 		name: 'testAp3',
// 		site: 'pvn',
// 		freq: 2450,
// 		band: 2.8,
// 		bearing: 200,
// 		beamwidth: 90,
// 		radius: 10*1609.34  };
// var y = {
// 		name: 'testAp4',
// 		site: 'pvn',
// 		freq: 2075,
// 		band: 5.2,
// 		bearing: 60,
// 		beamwidth: 90,
// 		radius: 10*1609.34 
// 		};
// var t = {
// 		name: 'testAp5',
// 		site: '51E',
// 		freq: 2550,
// 		band: 2.6,
// 		bearing: 90,
// 		beamwidth: 90,
// 		radius: 10*1609.34  };
// var v =	{
// 		name: 'testAp6',
// 		site: '51E',
// 		freq: 2185,
// 		band: 5,
// 		bearing: 235,
// 		beamwidth: 70,
// 		radius: 10*1609.34 
// 		};
// pSlice.placeMarker(36.113225, -97.058395, 'pvn', 100);
// pSlice.addRadio(center, r);
// pSlice.addRadio(center, testRadio);
// pSlice.addRadio(center, x);
// pSlice.addRadio(center, y);

// pSlice.placeMarker(36.122800, -96.924912, '51E', 75);
// center = new google.maps.LatLng(36.122800, -96.924912);
// pSlice.addRadio(center, t);
// pSlice.addRadio(center, v);



// pSlice.placeMarker(35.940088, -97.303856, 'Langston', 220, t);