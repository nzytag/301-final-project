'use strict';

let map, infoWindow;
let pos = {};
let des = [];


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 47.6182,
      lng: -122.3519
    },
    zoom: 16
  });
  infoWindow = new google.maps.InfoWindow();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        let request = {
          location: pos,
          // rankBy: google.maps.places.RankBy.DISTANCE,
          radius: '500',
          name: ['subway'],//search by name
          // type: ['coffee'],// search by type
          // keyword: ['coffee']// search by keyword
        };

        // this is my current Location
        let marker = new google.maps.Marker({
          position: pos,
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // image,
          animation: google.maps.Animation.DROP,
          map: map
        });
        map.setCenter(pos);

        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, processResults);
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function processResults(results, status) {
  //console.log(results);
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      createMarker(results[i])
      des.push({
        lat: results[i].geometry.location.lat(),
        lng: results[i].geometry.location.lng()
      });

    }
  }
  var distance = new google.maps.DistanceMatrixService;
  distanceLocation(distance);
  var elevator = new google.maps.ElevationService;
  displayLocationElevation(elevator);
}


// creates the markers
function createMarker(place) {
  let marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map
  });
// this code lets you click on the marker for more info
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

// calculate elevation
function displayLocationElevation(elevator) {
  // Initiate the location request
  elevator.getElevationForLocations({
    locations: [pos],
  }, function(response, err){
    if (!err){console.log(response[0].elevation*3.28)}
    console.log(Math.floor(response[0].elevation*3.28))
  })
}


// calculate distance
function distanceLocation(distance) {
  //console.log([`${des[0].lat}, ${des[0].lng}`]);
   for (let i = 0; i < des.length; i++) {
  distance.getDistanceMatrix({
    origins: [pos],
    destinations: [`${des[i].lat}, ${des[i].lng}`],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  }, function(results, err){
    console.log(results.rows[0].elements[0].distance.text);
  })
 } 
}

// this functions tell you if you are allowed the GPS to be accessed.
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
