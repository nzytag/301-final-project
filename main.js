'use strict';

// Todo 1) If elevation is lower - take out ABS
//      2) Error Handling

let map, infoWindow;
let pos = {};
let des = [];
let elevPos = {};

let searchResults = [];

function SearchResultsObject(name, add, openh, dis, ele, rating, elecomp, imgUrl,ed) {
  this.name = name;
  this.address = add;
  this.openhrs = openh
  this.distance = dis;
  this.elevation = ele;
  this.rating = rating;
  this.elevationcomp = elecomp;
  this.imgUrl = imgUrl;
  this.equivdist = ed;
}
// this.distance + (7.92*this.elecomp)
function initMap(e) {
  e.preventDefault();
  
  mapCreate();
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // empty the handlebars and results
        searchResults = [];
        $('.search-details').empty();

        var elevator = new google.maps.ElevationService;
        getElevationPos(elevator);

        function getElevationPos(elevator) {
          // Initiate the location request
          elevator.getElevationForLocations({
            locations: [pos],
          }, function(response, err) {
            if (!err){console.log(response[0].elevation*3.28)}
            elevPos = (Math.floor(response[0].elevation*3.28))
          })
        }

        let request = {
          location: pos,
          key='AIzaSyCFvCBTC4gncWVqiOHfjbPWRQsmI9DXFP4',
          // rankBy: google.maps.places.RankBy.DISTANCE,
          radius: '1000',
          // name: [$('#search-name').val()],//search by name
          // type: [$('#search-type').val()],// search by type
          keyword: [$('#search').val()]// search by keyword
        };

        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, processResults);

        // center map on current Location
        centerMarker();
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
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      createMarker(results[i])
      des.push({
        lat: results[i].geometry.location.lat(),
        lng: results[i].geometry.location.lng()
      })
      searchResults.push(new SearchResultsObject(results[i].name, results[i].vicinity, null, 0, 0, results[i].rating,0));
      searchResults[i].imgUrl = (results[i].photos) ? results[i].photos[0].getUrl({maxWidth: 1000}) : 'http://via.placeholder.com/350x150';
      searchResults[i].openhrs = (results[i].opening_hours) ? results[i].opening_hours : "Not Available";
      }
     console.log(results);
  }
  let distance = new google.maps.DistanceMatrixService;
  let statusD = distanceLocation(distance);
  let elevator = new google.maps.ElevationService;
  let statusE = displayLocationElevation(elevator);

  setTimeout(accordPopulate, 500);
  setTimeout(equivdistCalc, 500);
}

function centerMarker() {
  let marker = new google.maps.Marker({
    position: pos,
    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // image,
    animation: google.maps.Animation.DROP,
    map: map
  });
  map.setCenter(pos);
}

// creates the markers and lets you click on the marker for more info
function createMarker(place) {
  let marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map
  });
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

//calculate distance
function distanceLocation(distance) {
  let statusD = false;
  for (let i = 0; i < searchResults.length; i++) {
    distance.getDistanceMatrix({
      origins: [pos],
      destinations: [des[i]],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(results, err){
      searchResults[i].distance =  Number((results.rows[0].elements[0].distance.text).substr(0,(results.rows[0].elements[0].distance.text).length-3));
      statusD = true;
    })
  }
  return statusD;
}

// calculate elevation
function displayLocationElevation(elevator) {
  let statusE = false;
  for (let i = 0; i < searchResults.length; i++) {
    elevator.getElevationForLocations({
      locations: [des[i]],
    }, function(response, err){
      searchResults[i].elevation =  Math.floor(response[0].elevation*3.28);
      searchResults[i].elevationcomp =  Math.abs(searchResults[i].elevation - elevPos);
      statusE = true;
    });
  }
  console.log(searchResults);
  return statusE;
}

function equivdistCalc() {
  for (let i = 0; i < searchResults.length; i++) {
    let naismith_ed = ((((searchResults[i].distance*1.6) + (7.92*(searchResults[i].elevationcomp*.3048/1000))))*0.62);
    searchResults[i].equivdist = Number(naismith_ed.toPrecision(4));
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
