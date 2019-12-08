// alert('working!');

let patientsArray = [];
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;

function Patient(sex, age, height, weight, creatinine) {
  this.sex = sex;
  this.age = age;
  this.height = height;
  this.weight = weight;
  this.creatinine = creatinine;
  patientsArray.push(this);
}

// Form
let userForm = document.getElementById('user-form');
let appendHere = document.getElementById('appendTest');
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
  appendHere.innerHTML = weightVar;
}

