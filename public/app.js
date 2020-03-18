'use strict';

let allDrugsWithIndications = [];
let selectedDrugFront;

function DrugsWithIndications(drug, indication) {
  this.drug_name = drug;
  this.indication = indication;
  allDrugsWithIndications.push(this);
}

// Drop down menu
function handleSelectedDrugForIndications() {
  selectedDrugFront = $('#selectDrug option:checked').val();
  $.get('drugIndications.json').then(data => {
    data.forEach(item => {
      new DrugsWithIndications(item.drug_name, item.indication);
    })
    const drug_namesWithIndications = allDrugsWithIndications.map(name => name.drug_name);
    if (drug_namesWithIndications.includes(selectedDrugFront)) {
      getIndications();
    }
  });
}

$('#selectIndication').css('background-color', '#F6F6F8');
$('#selectDrug').on('change', function () {
  $('#selectIndication').css('border-color', 'rgb(169, 169, 169)');
  $('#selectIndication').css('background-color', '#F6F6F8');
  $('#selectIndication').empty();
  $('#selectIndication').append(`<option value="default">(select indication)</option>`);
  $('#selectIndication').attr('disabled', 'disabled');
})

$('#selectIndication').on('change', function () {
  if ($('#selectIndication option').val() !== 'default') {
    $('#selectIndication').css('border-color', 'rgb(169, 169, 169)');
    $('#selectIndication').css('background-color', '#E3E3E3');
  }
})

function getIndications() {
  $('#selectIndication').removeAttr('disabled');
  $('#selectIndication').empty();
  $('#selectIndication').append(`<option value="default">(select indication)</option>`);
  for (let i = 0; i < allDrugsWithIndications.length; i++) {
    if (allDrugsWithIndications[i].drug_name === selectedDrugFront) {

      $('#selectIndication').append(`<option value=${allDrugsWithIndications[i].indication}>${allDrugsWithIndications[i].indication}</option>`);

      //source: https://stackoverflow.com/questions/35208170/removing-duplicates-from-a-select-dropdown-using-javascript-or-jquery
      var optionValues = [];
      $('#selectIndication option').each(function () {
        if ($.inArray(this.value, optionValues) > -1) {
          $(this).remove()
        } else {
          optionValues.push(this.value);
        }
      });
      //
    }
  }
}

// burger menu to X on click
function burgerToX(x) {
  x.classList.toggle('changeMenu');
  $('#appendMenu').append($('#menuContainer'));
  $('#menuContainer').slideToggle(200);
  $('#menuContainer li').css('padding', '3px');
}

let $everythingAfterHDRadio = $('#hdContainer').nextAll();
$everythingAfterHDRadio.css('display', 'none');
$('button').css('display', 'block');

function displayPatientInputForm() {
  let hdValue = $('input[name=hd]:checked').val();
  if (hdValue === 'no') {
    $everythingAfterHDRadio.css('display', 'block');
    $('button').text('Get CrCl / Dose');
  } else if (hdValue === 'yes') {
    $everythingAfterHDRadio.css('display', 'none');
    $('button').css('display', 'block');
    $('button').text('Get Dose');
  }
}
