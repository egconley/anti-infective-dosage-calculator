'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const pg = require('pg');
const cors = require('cors');
require('ejs');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

let urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/', homePage);

// const constructors = require('./constructors.js'); 

function homePage(req, res) {
  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: null, CrClKey: null, doseRecKey: null });
}

let allDrugNames = [];
// let selectedDrug;
let patientsArray = [];
let doseRecArray = [];
let hdVar;
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let creatinineClearance = -1986;
let doseQuery;
let doseGuidelines;
let doseRec;

console.log('CrCl at start: ', creatinineClearance);

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
  if (sexVar === "female") {
    creatinineClearance = Math.round((0.85 * ((140 - ageVar) / (creatinineVar)) * (weightVar / 72)) * 100) / 100;
  } else {
    creatinineClearance = Math.round(((140 - ageVar) / (creatinineVar)) * (weightVar / 72) * 100) / 100;
  }
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

// get dose
function getDose(drug) {
  if (isNaN(creatinineClearance)) {
    doseQuery = {
      text: `SELECT DISTINCT
        a.drug_name, 
        a.route, 
        b.crcl_level, 
        b.indication, 
        b.dose, 
        a.notes
      FROM anti_microbial_drugs a
      LEFT JOIN hd_dosing b ON a.drug_name = b.drug_name
      WHERE a.drug_name = $1 
      ORDER BY drug_name;`,
      values: [`${drug}`],
    }
  } else {
    doseQuery = {
      text: `SELECT DISTINCT
        a.drug_name, 
        a.route, 
        b.crcl_level, 
        b.indication, 
        b.dose, 
        a.notes
      FROM anti_microbial_drugs a
      LEFT JOIN dosing_by_CrCl_level b ON a.drug_name = b.drug_name
      WHERE a.drug_name = $1 AND $2 > b.crcl_cutoff_low AND $2 < b.crcl_cutoff_high 
      ORDER BY drug_name;`,
      values: [`${drug}`, `${creatinineClearance}`],
    }
  }
}

// populate dropdown menu with drug names
client.query(`SELECT DISTINCT drug_name 
              FROM anti_microbial_drugs a
              WHERE drug_name IN
              (SELECT DISTINCT drug_name
               FROM dosing_by_crcl_level)
              ORDER BY drug_name;`).then(res => {

  const drug_names = res.rows.map(name => name.drug_name);
  drug_names.forEach(drug_name => {
    new Drug(drug_name);
  })

}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});

app.post('/dose', urlencodedParser, function (req, res) {
  console.log('post request successful!!', req.body);

  let selectedDrug = req.body.drugs;
  console.log('req.body.drugs: ', selectedDrug);
  console.log('patient info before function: ', patientsArray);
  handlePatientInfo(req);
  calculateCrCl();
  console.log('CrCl available for dose: ', creatinineClearance);
  getDose(selectedDrug);

  doseGuidelines = client.query(doseQuery).then(databaseResult => {

    console.log('databaseResult: ', databaseResult);
    doseGuidelines = databaseResult.rows;
    doseRecArray = [];
    for (let i = 0; i < doseGuidelines.length; i++) {
      new DoseGuidelines(doseGuidelines[i]);
    }

    let doseRecStringified = JSON.stringify(doseRec);
    console.log('stringified dose rec', doseRecStringified);

    res.render('pages/doseGuidance', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, CrClKey: creatinineClearance, doseRecKey: doseRecArray })
  })
})

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
