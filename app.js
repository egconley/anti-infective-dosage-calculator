// alert('working!');

let patientsArray = [];
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let userForm = document.getElementById('user-form');
let appendHere = document.getElementById('appendTest');
let CGequationEl = document.getElementById('CGequation');

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
    // this calculation doesn't seem to be correct - or at least, the output units don't match mdcalc.com
    creatinineClearance = ((140-ageVar)*0.85)/(72*creatinineVar);
    appendHere.innerHTML = creatinineClearance;
  } else {
    // this calculation doesn't seem to be correct - or at least, the output units don't match mdcalc.com
    creatinineClearance = (140-ageVar)/(72*creatinineVar);
    appendHere.innerHTML = creatinineClearance;
  }
}