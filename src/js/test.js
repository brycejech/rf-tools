// File for testing pie-slice.js

var r = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp',
		site_name: 'pvn',
		tx_freq: 2400,
		band: 2.5,
		ant_azimuth: 160,
		ant_beamwidth: 90,
		site_range: 10
};

var testRadio = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp2',
		site_name: 'pvn',
		tx_freq: 2675,
		band: 5.8,
		ant_azimuth: 300,
		ant_beamwidth: 90,
		site_range: 10
};

var x = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp3',
		site_name: 'pvn',
		tx_freq: 2450,
		band: 2.8,
		ant_azimuth: 200,
		ant_beamwidth: 90,
		site_range: 10
};

var y = {
		lat: 36.113225,
		lng: -97.058395,
		device_name: 'testAp4',
		site_name: 'pvn',
		tx_freq: 2075,
		band: 5.2,
		ant_azimuth: 60,
		ant_beamwidth: 90,
		site_range: 10
};

pSlice.addRadio(r);
pSlice.addRadio(testRadio);
pSlice.addRadio(x);
pSlice.addRadio(y);



test_site = {
	'site_name': 	'Test Site 1',
	'height': 		100,
	'site_range': 	10,
	'site_number': 	1,
	'type': 		'Rhone 25',
	'lat': 			36.1132317,
	'lng': 			-97.0583649
}

// console.log(pSlice);
pSlice.add_site(test_site);