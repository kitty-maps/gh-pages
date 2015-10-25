var map;

var PF_SHELTER_FIND = "https://api.petfinder.com/shelter.find?key={token}&format=json&location={zipcode}";
var MB_REVERSE_GEOCODER = "https://api.mapbox.com/geocoding/v5/mapbox.places/{lon},{lat}.json?access_token={token}"

var MAPBOX_TOKEN = "pk.eyJ1IjoibWllbmFpa29lIiwiYSI6ImNpZzZxMGNidjVtNDZ0NW0zd21xc20yMTEifQ.Yz9I2vVWcteSI_lBMgu2HA";
var PETFINDER_TOKEN = "a40ced299f8c2999eac980a8b934d0a7";

function reverseGeocode(latlon){
  return new Promise(function(resolve, reject){
    function reqListener () {
      resolve(JSON.parse(this.responseText));
    }
    var url = MB_REVERSE_GEOCODER
        .replace("{lat}",latlon[0])
        .replace("{lon}",latlon[1])
        .replace("{token}", MAPBOX_TOKEN);

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
  });
}

function getShelters(zipcode){
  return new Promise(function(resolve, reject){
    function reqListener () {
      resolve(JSON.parse(this.responseText).petfinder.shelters.shelter);
    }
    var url = PF_SHELTER_FIND
        .replace("{zipcode}", zipcode)
        .replace("{token}", PETFINDER_TOKEN);

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
  });
}






document.addEventListener("DOMContentLoaded", function(event) {
  var latlon = [39.50, -98.35]; // center of U.S.A.

  L.mapbox.accessToken = MAPBOX_TOKEN;
  map = L.mapbox.map('map', 'mapbox.streets');
  map.setView( latlon, 7); // all of U.S.

  var latlonAfter = function(){
    reverseGeocode( latlon ).then(function(geocode){
      console.log(geocode);
      var postcode;
      for( var ix in geocode.features ){
        var feature = geocode.features[ix];
        if( feature.id.indexOf("postcode") === 0 ){
          postcode = feature.text
        }
      }
      getShelters( postcode ).then(function(shelters){
        for( var ix in shelters ){
          var shelter = shelters[ix];
          L.marker([
            parseFloat(shelter.latitude.$t),
            parseFloat(shelter.longitude.$t)
          ]).addTo(map);
        }
        // add shelters to map
      })
    });
  }
  navigator.geolocation.getCurrentPosition( function(pos){
    latlon = [ pos.coords.latitude, pos.coords.longitude ];
    map.setView(latlon, 10);
    latlonAfter();
  }, function(){
    console.warn("Could not lookup user's latlon");
    latlonAfter();
  });
});
