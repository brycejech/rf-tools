// File for testing pie-slice.js

var test_radio = {
		lat: 36.113225,
		lng: -97.058395,
		device_name: 'testAp',
		site_name: 'pvn',
		tx_freq: 2400,
		band: 2.5,
		ant_azimuth: 180,
		ant_beamwidth: 90,
		site_range: 10,
		ip: '10.1.5.2',
		tx_chan_width: 20
};

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
pSlice.add_radio(test_radio);
