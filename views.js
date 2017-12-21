'use strict';


// builds the according
function accordPopulate() {
  $('.search-details').show();
  $('#info').hide();
  $('search').empty();
  $('main').show();
  $('img').hide();
  // $('#map').show();
  let template = Handlebars.compile($('#results-template').text());
  searchResults.map(place => {$('.search-details').append(template(place));})

  var acc = $('.accordion');

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function() {
      this.classList.toggle('active');
      var panel = this.nextElementSibling;
      if (panel.style.display === 'block') {
        $(this.nextElementSibling).slideUp(200);
      } else {
        $('.panel').slideUp(300);
        $(this.nextElementSibling).slideDown(200);
      }
    });
  }
}



// builds the loading screen
var pikachu = $('img').hide();
function loadingScreen(){
  $('main').hide()
  $('img').show();
  $('.search-details').hide();
  // $('#map').hide();
}

$('#search-btn').on('click', function(){
  initMap(event);
  loadingScreen();
})
