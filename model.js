'use strict';

// dependencies
const db = require('./db.js');

// instance variables
let allDrugNames = [];
let drugsWithIndications = [];
let patientsArray = [];

// constructors
function Drug(drug) {
  this.drug_name = drug;
  allDrugNames.push(this);
}

function Patient(sex, age, weight, serumCreatinine) {
  this.sex = sex;
  this.age = age;
  this.weight = weight;
  this.serumCreatinine = serumCreatinine;
  patientsArray.push(this);
}

function DoseGuidelines(doseGuidelines) {
  this.drug_name = doseGuidelines.drug_name;
  this.route = doseGuidelines.route;
  this.crcl_level = doseGuidelines.crcl_level;
  this.indication = doseGuidelines.indication;
  this.dose = doseGuidelines.dose;
  this.notes = doseGuidelines.notes;
}

// getters
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


// setters
function setPatientInfo(req) {
  const sex = req.body.sex;
  const age = Number(req.body.age);
  const weight = Number(req.body.weight);
  const serumCr = Number(req.body.serumCr);
  return new Patient(sex, age, weight, serumCr);
}

function calculateCrCl(patient) {
  let creatinineClearance;
  if (patient.sex === 'female') {
    creatinineClearance = Math.round((0.85 * ((140 - patient.age) / (patient.serumCreatinine)) * (patient.weight / 72)) * 100) / 100;
  } else {
    creatinineClearance = Math.round(((140 - patient.age) / (patient.serumCreatinine)) * (patient.weight / 72) * 100) / 100;
  }
  return creatinineClearance;
}

// exports
exports.allDrugNames = allDrugNames;
exports.drugsWithIndications = drugsWithIndications;
exports.patientsArray = patientsArray;
exports.Drug = Drug;
exports.Patient = Patient;
exports.DoseGuidelines = DoseGuidelines;
exports.setPatientInfo = setPatientInfo;
exports.calculateCrCl = calculateCrCl;

