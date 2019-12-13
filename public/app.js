'use strict';

let patientsArray = [];
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let userForm = document.getElementById('user-form');
let appendHere = document.getElementById('appendTest');

// Drop down menu
$('select').on('change', function(){
  let selectedDrug = $(this).val()
  console.log(selectedDrug);
})

function Patient(sex, age, height, weight, creatinine) {
  this.sex = sex;
  this.age = age;
  this.height = height;
  this.weight = weight;
  this.creatinine = creatinine;
  patientsArray.push(this);
}

// Form
userForm.addEventListener('submit', handlesubmit);

function handlesubmit(e) {
  e.preventDefault();

  sexVar = event.target.sexInput.value;
  ageVar = Number(event.target.ageInput.value);
  heightVar = Number(event.target.heightInput.value);
  weightVar = Number(event.target.weightInput.value);
  creatinineVar = Number(event.target.creatinineInput.value);

  let newPatient = new Patient(sexVar, ageVar, heightVar, weightVar, creatinineVar);

  console.log(newPatient);

  displayEquationData()
}

// Equation
function displayEquationData() {
  // CGequationEl.innerHTML = CGequationEl.innerHTML.replace(/age/g, ageVar);
  if (sexVar==="female") {
    creatinineClearance = (0.85 * ((140 - ageVar) / (creatinineVar)) * (weightVar / 72));
    appendHere.innerHTML = creatinineClearance.toFixed(1);
  } else {
    creatinineClearance = ((140 - ageVar) / (creatinineVar)) * (weightVar / 72);
    appendHere.innerHTML = creatinineClearance.toFixed(1);
  }
}

// burger menu to X on click
function burgerToX(x) {
  x.classList.toggle('changeMenu');
  $('#appendMenu').append($('#menuContainer'));
  $('#menuContainer').slideToggle(200);
  $('#menuContainer li').css('padding', '3px');
}