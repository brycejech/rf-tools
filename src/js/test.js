// File for testing pie-slice.js//Test data

var r = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp',
		site_name: 'pvn',
		tx_freq: 2400,
		band: 2.5,
		ant_azimuth: 160,
		ant_beamwidth: 90,
		site_range: 10*1609.34 };
var testRadio = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp2',
		site_name: 'pvn',
		tx_freq: 2675,
		band: 5.8,
		ant_bearing: 300,
		ant_beamwidth: 90,
		site_range: 10*1609.34 
		};
//var center = new google.maps.LatLng(36.113225, -97.058395);
var x = {
		lat: 36.113225,
		lng: -97.058395,
		deivce_name: 'testAp3',
		site_name: 'pvn',
		tx_freq: 2450,
		band: 2.8,
		ant_bearing: 200,
		ant_beamwidth: 90,
		site_range: 10*1609.34  };
var y = {
		lat: 36.113225,
		lng: -97.058395,
		device_name: 'testAp4',
		site_name: 'pvn',
		tx_freq: 2075,
		band: 5.2,
		ant_bearing: 60,
		ant_beamwidth: 90,
		site_range: 10*1609.34 
		};
// var t = {
// 		device_name: 'testAp5',
// 		site_name: '51E',
// 		tx_freq: 2550,
// 		band: 2.6,
// 		ant_bearing: 90,
// 		ant_beamwidth: 90,
// 		site_range: 10*1609.34  };
// var v =	{
// 		device_name: 'testAp6',
// 		site_name: '51E',
// 		tx_freq: 2185,
// 		band: 5,
// 		ant_bearing: 235,
// 		ant_beamwidth: 70,
// 		site_range: 10*1609.34 
// 		};
pSlice.placeMarker(36.113225, -97.058395, 'pvn', 100);
pSlice.addRadio(center, r);
pSlice.addRadio(center, testRadio);
pSlice.addRadio(center, x);
pSlice.addRadio(center, y);
