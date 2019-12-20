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

function homePage(req, res) {
  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: null, CrClKey: null });
}

let allDrugNames = [];
let selectedDrug;
let patientsArray = [];
let sexVar;
let ageVar;
let heightVar;
let weightVar
let creatinineVar;
let creatinineClearance;

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

client.query('SELECT DISTINCT drug_name FROM anti_microbial_drugs ORDER BY drug_name').then(res => {

  const drug_names = res.rows.map(name => name.drug_name);
  drug_names.forEach(drug_name => {
    new Drug(drug_name);
  })

}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  // client.end()
});

function getDose() {
  console.log('CrCl available for dose: ', creatinineClearance)
  const doseQuery = {
    text: `SELECT 
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
    values: [`${selectedDrug}`, `${creatinineClearance}`],
  }
  client.query(doseQuery).then(res => {

    console.log('dose info from database', res.rows)

  }).catch(err => {
    console.log(err.stack);
  }).finally(() => {
    // client.end()
  });
}

app.post('/postDrug', urlencodedParser, function (req, res) {
  // console.log('post request successful!!');
  selectedDrug = req.body.drugs;
  console.log('req.body.drugs: ', selectedDrug);

  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, CrClKey: null });
});

app.post('/postCrCl', urlencodedParser, function (req, res) {
  console.log('post request successful!!', req.body);

  sexVar = req.body.sex;
  ageVar = Number(req.body.age);
  heightVar = Number(req.body.height);
  weightVar = Number(req.body.weight);
  creatinineVar = Number(req.body.serumCr);

  let newPatient = new Patient(sexVar, ageVar, heightVar, weightVar, creatinineVar);

  console.log(newPatient);
  calculateCrCl();
  getDose();

  console.log('CrCl: ', creatinineClearance)

  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug, CrClKey: creatinineClearance});
})

// Equation
function calculateCrCl() {
  if (sexVar==="female") {
    creatinineClearance = Math.round((0.85 * ((140 - ageVar) / (creatinineVar)) * (weightVar / 72)))/100;
  } else {
    creatinineClearance = Math.round(((140 - ageVar) / (creatinineVar)) * (weightVar / 72))/100;
  }
}

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
