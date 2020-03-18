'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
require('ejs');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

let urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');

// connect to database
const db = require('./db.js');

app.get('/', homePage);
app.get('/about', aboutPage);
app.get('/technical', techDocPage);
app.get('/resources', resourcesPage);

function homePage(req, res) {
  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: null, drugsWithIndicationsKey: drugsWithIndications, CrClKey: null, doseRecKey: null });
}

function aboutPage(req, res) {
  res.render('pages/about');
}

function techDocPage(req, res) {
  res.render('pages/technical');
}

function resourcesPage(req, res) {
  res.render('pages/resources');
}

let allDrugNames = [];
let drugsWithIndications = [];
let patientsArray = [];
let doseRecArray = [];
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let doseGuidelines;
let doseRec;

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
  doseRecArray.push(this);
}

// Equation
function calculateCrCl() {
  let creatinineClearance;
  if (sexVar === "female") {
    creatinineClearance = Math.round((0.85 * ((140 - ageVar) / (creatinineVar)) * (weightVar / 72)) * 100) / 100;
  } else {
    creatinineClearance = Math.round(((140 - ageVar) / (creatinineVar)) * (weightVar / 72) * 100) / 100;
  }
  return creatinineClearance;
}

// User Patient Input
function handlePatientInfo(req) {
  sexVar = req.body.sex;
  ageVar = Number(req.body.age);
  heightVar = Number(req.body.height);
  weightVar = Number(req.body.weight);
  creatinineVar = Number(req.body.serumCr);

  let newPatient = new Patient(sexVar, ageVar, heightVar, weightVar, creatinineVar);
  console.log(newPatient);
}

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

app.post('/dose', urlencodedParser, function (req, res) {

  handlePatientInfo(req);
  const crcl = calculateCrCl();
  let selectedDrug = req.body.drugs;
  let selectedIndication = req.body.indications;

  doseGuidelines = db.getDoseGuidelines(selectedDrug, selectedIndication, crcl).then(databaseResult => {
    console.log('databaseResult: ', databaseResult);
    doseGuidelines = databaseResult.rows;
    doseRecArray = [];
    for (let i = 0; i < doseGuidelines.length; i++) {
      new DoseGuidelines(doseGuidelines[i]);
    }
    res.render('pages/doseGuidance', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: drugsWithIndications, CrClKey: crcl, doseRecKey: doseRecArray })
  })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
