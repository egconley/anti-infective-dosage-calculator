'use strict';

// burger menu to X on click
function burgerToX(x) {
  x.classList.toggle('changeMenu');
  $('#appendMenu').append($('#menuContainer'));
  $('#menuContainer').slideToggle(200);
  $('#menuContainer li').css('padding', '3px');
}

let $everythingAfterHDRadio = $( "#hdRadio" ).nextAll();
$everythingAfterHDRadio.css( "display", "none" );
$('button').css( "display", "block" );

function displayPatientInputForm() {
  let hdValue = $('input[name=hd]:checked').val();
  if (hdValue==='no') {
    $everythingAfterHDRadio.css( "display", "block" );
  } else if (hdValue==='yes') {
    $everythingAfterHDRadio.css( "display", "none" );
    $('button').css( "display", "block" );
  }
}

