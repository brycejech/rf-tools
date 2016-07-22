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


var pSlice = (function(window, google, undefined){


	//Global Variables
	var towers = {},
		info_windows = [],
		sectors = [],
		EarthRadiusMeters = 6378137.0, // meters
		element = document.getElementById('gmap-canvas'),
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


	function add_site(site){
		// site - obj literal

		// Set up the info window and elements
		var container = document.createElement('div'),
			header = document.createElement('h3'),
			table = document.createElement('talbe');

		container.setAttribute('class', 'site-info-window');
		table.setAttribute('data-name', site.site_name);
		table.setAttribute('class', 'site');

		header.innerHTML = site.site_name;

		container.appendChild(header);
		container.appendChild(table);

		elems = ['site_number', 'site_range', 'height', 'type']

		display_format = {
			'site_number': 	'Site Number:',
			'site_range': 	'Range:',
			'height': 		'Height:',
			'type': 		'Type:'
		}

		for(var i = 0; i < elems.length; i++){
			var row = document.createElement('tr'),
				col = document.createElement('td'),
				val = document.createElement('td')

			col.setAttribute('style', 'text-align: left; font-weight: bold');
			val.setAttribute('style', 'text-align: right;');
			col.innerHTML = display_format[elems[i]];
			val.innerHTML = site[elems[i]];
			row.appendChild(col);
			row.appendChild(val);
			table.appendChild(row);
		}

		var info_window = addInfoWindow(site.site_name, container);
		info_windows.push(info_window);


		marker_options = {
			map: map,
			name: site.site_name,
			height: site.height,
			position: {
				'lat': site.lat,
				'lng': site.lng
			}
		}

		towers[site.site_name] = new google.maps.Marker(marker_options);

		onInfoWindow_Click(towers[site.site_name], info_window);
		onInfoWindow_MouseOut(towers[site.site_name], info_window);

	}





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
	    onInfoWindow_Click(towers[name], info_window);
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
                fillColor: "#010078",//rf.get_color_by_freq(freq),
                fillOpacity: 0.8,
                zIndex: global_z_index,
                map: map
     });

		sectors.push(sector_polygon);
		//info_window.bindTo('map', sector_polygon);
		//adds mouse over/out events for each polygon
		onInfoWindow_Click(sector_polygon, info_window, windowPt);
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

		console.log(radio)
		
		var center 		= new google.maps.LatLng(parseFloat(radio.lat), parseFloat(radio.lng)),
			azimuth 	= parseFloat(radio.ant_azimuth),
			beamwidth 	= parseFloat(radio.ant_beamwidth),
			// Convert range from miles to meters
			range 		= parseFloat(radio.site_range) * 1609.344;
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
	function onInfoWindow_Click(poly, info_window, windowPt){

		google.maps.event.addListener(poly,'click', function(){
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
					// Increment global_z_index so sector appears on top when toggled on
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
		toggle_sector: function(name){ return toggle_sector(name) },
		add_site: function(site){ return add_site(site) }
	}	
})(window, google, undefined);
