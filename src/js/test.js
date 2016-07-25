// File for testing pie-slice.js

var test_radio = {
		lat: 36.113225,
		lng: -97.058395,
		device_name: 'Test AP 1',
		site_name: 'Test Site 1',
		tx_freq: 2400,
		band: 2.5,
		ant_azimuth: 180,
		ant_beamwidth: 90,
		site_range: 10,
		ip: '127.0.0.1',
		tx_chan_width: 20
};
pSlice.add_radio(test_radio);

var test_site = {
	'site_name': 	'Test Site 1',
	'height': 		100,
	'site_range': 	10,
	'site_number': 	1,
	'type': 		'Rhone 25',
	'lat': 			36.1132317,
	'lng': 			-97.0583649
};
pSlice.add_site(test_site);

var test_site_2 = {
	'site_name': 	'Test Site 2',
	'height': 		100,
	'site_range': 	8,
	'site_number': 	2,
	'type': 		'Rhone 45',
	'lat': 			36.204420,
	'lng': 			-96.936350
}
pSlice.add_site(test_site_2);


backhaul1 = {
	'device_name': 		'Test Backhaul 1',
	'site_name': 		'Test Site 1',
	'ssid': 			'Backhaul Link',
	'tx_freq': 			2400,
	'tx_chan_width': 	20,
	'lat': 				36.1132317,
	'lng': 				-97.0583649
}

backhaul2 = {
	'device_name': 		'Test Backhaul 2',
	'site_name': 		'Test Site 2',
	'ssid': 			'Backhaul Link',
	'tx_freq': 			2400,
	'tx_chan_width': 	20,
	'lat': 				36.204420,
	'lng': 				-96.936350
}

pSlice.add_backhaul(backhaul1, backhaul2);


