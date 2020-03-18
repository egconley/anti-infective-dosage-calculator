const db = require('./db.js');

let allDrugNames = [];
let drugsWithIndications = [];
let patientsArray = [];

// Constructors
function Drug(drug) {
  this.drug_name = drug;
  allDrugNames.push(this);
}

function Patient(sex, age, height, weight, creatinine) {
  this.sex = sex;
  this.age = age;
  this.height = height;
  this.weight = weight;
  this.creatinine = creatinine;
  patientsArray.push(this);
}

function DoseGuidelines(doseGuidelines) {
  this.drug_name = doseGuidelines.drug_name;
  this.route = doseGuidelines.route;
  this.crcl_level = doseGuidelines.crcl_level;
  this.indication = doseGuidelines.indication;
  this.dose = doseGuidelines.dose;
  this.notes = doseGuidelines.notes;
  // doseRecArray.push(this);
  // console.log("dose rec array: " + doseRecArray[0]);
}

// Getters
db.getAllDrugs().then(res => {
  const drug_names = res.rows.map(name => name.drug_name);
  drug_names.forEach(drug_name => {
    new Drug(drug_name);
  })
}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});

db.getDrugsWithIndications().then(res => {
  drugsWithIndications = res.rows;
}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});


// Setters
function setPatientInfo(req) {
  const sex = req.body.sex;
  const age = Number(req.body.age);
  const weight = Number(req.body.weight);
  const creatinine = Number(req.body.serumCr);
  return new Patient(sex, age, weight, creatinine);
}

// Exports
exports.allDrugNames = allDrugNames;
exports.drugsWithIndications = drugsWithIndications;
exports.patientsArray = patientsArray;
exports.Drug = Drug;
exports.Patient = Patient;
exports.DoseGuidelines = DoseGuidelines;
exports.setPatientInfo = setPatientInfo;

