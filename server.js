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
// let selectedDrug;
let patientsArray = [];
let doseRecArray = [];
// let hdVar;
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let creatinineClearance = -1986;
// let doseQuery;
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
function getDoseQuery(drug, indication) {
  let doseQuery;
  console.log('INDICATION: ', indication);
  if (indication) {
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
        WHERE a.drug_name = $1 AND b.indication like $2
        ORDER BY drug_name;`,
        values: [`${drug}`, `${indication}%`],
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
        WHERE a.drug_name = $1 AND $2 > b.crcl_cutoff_low AND $2 < b.crcl_cutoff_high AND b.indication like $3
        ORDER BY drug_name;`,
        values: [`${drug}`, `${creatinineClearance}`, `${indication}%`],
      }
    }
  } else {
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
  console.log('DOSE QUERY: ', doseQuery);
  return doseQuery;
}

function getDoseGuidelines(selectedDrug, selectedIndication) {
  const sql = getDoseQuery(selectedDrug, selectedIndication);
  return client.query(sql);
}

// populate dropdown menu with drug names
function getAllDrugs() {
  const sql = `SELECT DISTINCT drug_name 
  FROM anti_microbial_drugs a
  WHERE drug_name IN
  (SELECT DISTINCT drug_name
   FROM dosing_by_crcl_level)
  ORDER BY drug_name;`;
  return client.query(sql);
}

getAllDrugs().then(res => {
  const drug_names = res.rows.map(name => name.drug_name);
  drug_names.forEach(drug_name => {
    new Drug(drug_name);
  })
}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});


// list of drugs with specific indications for indication dropdown
function getDrugsWithIndications() {
  const sql = `SELECT DISTINCT
              a.drug_name, b.indication
              FROM anti_microbial_drugs a
              LEFT JOIN dosing_by_CrCl_level b ON a.drug_name = b.drug_name
              WHERE (b.indication IS NULL)=FALSE
              ORDER BY drug_name;`;
  return client.query(sql);
}

getDrugsWithIndications().then(res => {
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
  calculateCrCl();
  console.log('CrCl available for dose: ', creatinineClearance);
  // const sql = getDoseQuery(selectedDrug, selectedIndication);

  doseGuidelines = getDoseGuidelines(selectedDrug, selectedIndication).then(databaseResult => {

    console.log('databaseResult: ', databaseResult);
    doseGuidelines = databaseResult.rows;
    doseRecArray = [];
    for (let i = 0; i < doseGuidelines.length; i++) {
      new DoseGuidelines(doseGuidelines[i]);
    }

    let doseRecStringified = JSON.stringify(doseRec);
    console.log('stringified dose rec', doseRecStringified);

    res.render('pages/doseGuidance', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: drugsWithIndications, CrClKey: creatinineClearance, doseRecKey: doseRecArray })
  })
})

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
