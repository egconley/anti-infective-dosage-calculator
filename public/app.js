'use strict';

// console.log('front end indications: ', indications);
let allDrugsWithIndications = [];
let selectedDrugFront;

function DrugsWithIndications(drug, indication) {
  this.drug_name = drug;
  this.indication = indication;
  allDrugsWithIndications.push(this);
}

// Drop down menu
function handleSelectedDrugForIndications() {
  selectedDrugFront = $("#selectDrug option:checked").val();
  console.log(selectedDrugFront);
  getIndications();
}

function getIndications() {
  $('#selectIndication').empty();
  $('#selectIndication').append(`<option value="default">select indication</option>`);
  $.get('drugIndications.json').then(data => {
    data.forEach(item => {
      new DrugsWithIndications(item.drug_name, item.indication);
    })
    for (let i=0; i<allDrugsWithIndications.length; i++) {
      if (allDrugsWithIndications[i].drug_name === selectedDrugFront) {
        console.log('indication to append', allDrugsWithIndications[i].indication)

        // $('#selectIndication').find(`<option value=${allDrugsWithIndications[i].indication}>${allDrugsWithIndications[i].indication}</option>`).remove();

        $('#selectIndication').append(`<option value=${allDrugsWithIndications[i].indication}>${allDrugsWithIndications[i].indication}</option>`);

        // remove duplicate options
        $("#selectIndication option").val(function(idx, val) {
          $(this).siblings('[value="'+ val +'"]').remove();
        });
        
        console.log($('#selectIndication'));
      }
    }
  });
}

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