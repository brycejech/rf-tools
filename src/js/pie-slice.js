// TODO //
// - Rename functions using lower_case_with_underscores
// - Add draw line functionality (will need it for backhauls)
// 		- should have info window on click with info on both backhauls
// - draw_sector() or add_radio() should check if sector exists before adding a new one
//		- google.maps.InfoWindow can take a DOM object as content


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
	// Initialize the map
	var map = new google.maps.Map(element, options);


	function add_site(site){
		// site - obj literal

		var site_name = site.site_name;

		// Set up marker
		var marker_options = {
			map: map,
			name: site_name,
			height: site.height,
			position: {
				'lat': site.lat,
				'lng': site.lng
			}
		};

		towers[site_name] = new google.maps.Marker(marker_options);

		var info_window = get_site_info_window(site);
		info_windows.push(info_window);
		// Rename this
		add_click_event(towers[site_name], info_window);

	}


	function get_site_info_window(site){

		var site_name = site.site_name
		// Set up the info window and elements
		var container = document.createElement('div'),
			header = document.createElement('h2'),
			table = document.createElement('talbe');

		container.setAttribute('class', 'site-info-window');
		table.setAttribute('data-name', site_name);
		table.setAttribute('class', 'site');

		header.innerHTML = site_name;

		container.appendChild(header);
		container.appendChild(table);

		var elems = ['site_number', 'site_range', 'height', 'type']

		var display_format = {
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

		var info_window = get_info_window(site_name, container);

		return info_window;
	}


	//function that adds radio info to tower info_window
	//Also creates polygon for radio based on bearing, beamwidth, and radius
	function add_radio(radio){
		
		var center 		= new google.maps.LatLng(parseFloat(radio.lat), parseFloat(radio.lng)),
			azimuth 	= parseFloat(radio.ant_azimuth),
			beamwidth 	= parseFloat(radio.ant_beamwidth),
			// Convert range from miles to meters
			range 		= parseFloat(radio.site_range) * 1609.344;
		
		var arcPts = get_arc_points(center, azimuth, beamwidth, range);


		var info_window = get_radio_info_window(radio);

  		var windowPt = get_destination_point(center, azimuth, range/2);

  		draw_sector(radio.device_name, radio.site_name, radio.tx_freq, arcPts, info_window, windowPt);
	}


	// Returns new info window containing radio info
	function get_radio_info_window(radio){

		var container = document.createElement('div'),
			header = document.createElement('h2'),
			table = document.createElement('table');

		header.innerHTML = radio.device_name;

		var elems = ['tx_freq', 'tx_chan_width', 'ip']

		var display_format = {
			'tx_freq': 			'Frequency:',
			'tx_chan_width': 	'Channel Width:',
			'ip': 				'Address'
		}

		for(var i = 0; i < elems.length; i++){

			var row = document.createElement('tr'),
				col = document.createElement('td'),
				val = document.createElement('td')

			col.setAttribute('style', 'text-align: left; font-weight: bold;');
			val.setAttribute('style', 'text-align: right;');

			col.innerHTML = display_format[elems[i]];

			if(elems[i] == 'ip'){
				var link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.setAttribute('href', 'http://' + radio.ip);
				link.innerHTML = radio.ip;

				val.appendChild(link);
			}
			else{
				val.innerHTML = radio[elems[i]];
			}

			row.appendChild(col);
			row.appendChild(val);
			table.appendChild(row);
		}

		container.appendChild(header);
		container.appendChild(table);

		var radio_window = get_info_window(radio.device_name, container);
		return radio_window;
	}


	function site_exists(name){

		for(var tower in towers){
			if(tower.name == name){
				return true;
			}
		}
		return false;
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
		//adds mouse over/out events for each polygon
		add_click_event(sector_polygon, info_window, windowPt);
		// onInfoWindow_MouseOut(sector_polygon, info_window, windowPt);
	}


	//function that returns a destination pt based on center coordinates, bearing, and radius
	function get_destination_point(center, bearing, radius){

		var R = EarthRadiusMeters; // earth's mean radius in meters
		var bearing = to_radians(bearing);
		var lat1 = to_radians(center.lat()), lon1 = to_radians(center.lng());
		var lat2 = Math.asin( Math.sin(lat1)*Math.cos(radius/R) + 
		                      Math.cos(lat1)*Math.sin(radius/R)*Math.cos(bearing) );
		var lon2 = lon1 + Math.atan2(Math.sin(bearing)*Math.sin(radius/R)*Math.cos(lat1), 
		                             Math.cos(radius/R)-Math.sin(lat1)*Math.sin(lat2));

		return new google.maps.LatLng(to_degrees(lat2), to_degrees(lon2));
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
			extp.push(get_destination_point(center, bearingR + i*deltaBearing, radius)); 
			//bounds.extend(extp[extp.length-1]);
		}
		extp.push(center); 
		return extp;
	}


	//function converts degrees to radians
	function to_radians(bearing) {

		return bearing * Math.PI / 180;
	}


	//function converts coordinates to degrees.
	function to_degrees(lat) {

		return lat * 180 / Math.PI;
	}


	//function for set map center to lat, lng
	function setCenter(lat, lng){

		map.setCenter({
	      'lat': lat,
	      'lng': lng
	    });
	}


	//function that removes tower(name) marker and sectors from the map
	function remove_marker(name){

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
	function remove_sector(name){

		for(var i = 0; i<sectors.length; i++){
			if(sectors[i].name == name){
				sectors[i].setMap(null);
				sectors.splice(i, 1);
			}
		}
		
	}


	//function that returns new info_window containing tower_info
	function get_info_window(name, tower_info){

		return new google.maps.InfoWindow({
			name: name,
	    	content: tower_info
	    	});
	}


	//function for adding mouse over event to poly, opening info_window on windowPt
	function add_click_event(poly, info_window, windowPt){

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

		add_radio: function(radio){ return add_radio(radio) },
		add_site: function(site){ return add_site(site) },
		toggle_sector: function(name){ return toggle_sector(name) },
		remove_marker: function(name){ return remove_marker(name) },
		remove_sector: function(name){ return remove_sector(name) },
		sectors: function(){ return sectors }
	}	
})(window, google, undefined);
