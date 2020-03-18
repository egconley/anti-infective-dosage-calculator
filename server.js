'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
// const pg = require('pg');
const cors = require('cors');
require('ejs');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

let urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');

// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', err => console.error(err));
const db = require('./db.js');

app.get('/', homePage);
app.get('/about', aboutPage);
app.get('/technical', techDocPage);
app.get('/resources', resourcesPage);

// const constructors = require('./constructors.js'); 

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
  // hdVar = req.body.hd;
  sexVar = req.body.sex;
  ageVar = Number(req.body.age);
  heightVar = Number(req.body.height);
  weightVar = Number(req.body.weight);
  creatinineVar = Number(req.body.serumCr);

  let newPatient = new Patient(sexVar, ageVar, heightVar, weightVar, creatinineVar);
  // console.log('hd', hdVar);
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
  console.log('DRUGS WITH INDICATIONS: ', res.rows);
}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});

app.post('/dose', urlencodedParser, function (req, res) {
  console.log('post request successful!!', req.body);

  let selectedDrug = req.body.drugs;
  let selectedIndication = req.body.indications;

  console.log('selected indication BACK END: ', selectedIndication);
  console.log('req.body.drugs: ', selectedDrug);
  console.log('patient info before function: ', patientsArray);
  handlePatientInfo(req);
  const crcl = calculateCrCl();
  console.log('CrCl available for dose: ', crcl);
  // const sql = getDoseQuery(selectedDrug, selectedIndication);

  doseGuidelines = db.getDoseGuidelines(selectedDrug, selectedIndication, crcl).then(databaseResult => {
    console.log('databaseResult: ', databaseResult);
    doseGuidelines = databaseResult.rows;
    doseRecArray = [];
    for (let i = 0; i < doseGuidelines.length; i++) {
      new DoseGuidelines(doseGuidelines[i]);
    }

    let doseRecStringified = JSON.stringify(doseRec);
    console.log('stringified dose rec', doseRecStringified);

    res.render('pages/doseGuidance', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: drugsWithIndications, CrClKey: crcl, doseRecKey: doseRecArray })
  })
})

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
