'use strict';

// Drop down menu
$('select').on('change', function(){
  let selectedDrug = $(this).val()
  console.log('jQuery connected to select')
  console.log(selectedDrug);
})

// burger menu to X on click
function burgerToX(x) {
  x.classList.toggle('changeMenu');
  $('#appendMenu').append($('#menuContainer'));
  $('#menuContainer').slideToggle(200);
  $('#menuContainer li').css('padding', '3px');
}

