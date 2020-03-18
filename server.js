'use strict';

// configs
require('dotenv').config();

// dependencies
const express = require('express');
const bodyParser = require('body-parser');
require('ejs');
const model = require('./model.js'); // data model
const db = require('./db.js'); // database

// declarations
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// routing
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');

app.get('/', homePage);
app.get('/about', aboutPage);
app.get('/technical', techDocPage);
app.get('/resources', resourcesPage);

function homePage(req, res) {
  res.render('pages/index', { drugArrayKey: model.allDrugNames, selectedDrugKey: null, drugsWithIndicationsKey: model.drugsWithIndications, CrClKey: null, doseRecKey: null });
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

app.post('/dose', urlencodedParser, function (req, res) {

  const patient = model.setPatientInfo(req);
  const crcl = model.calculateCrCl(patient);
  let selectedDrug = req.body.drugs;
  let selectedIndication = req.body.indications;
  let doseRecArray = [];

  db.getDoseGuidelines(selectedDrug, selectedIndication, crcl).then(databaseResult => {
    const doseGuidelines = databaseResult.rows;
    for (let i = 0; i < doseGuidelines.length; i++) {
      let dose = new model.DoseGuidelines(doseGuidelines[i]);
      doseRecArray.push(dose);
    }
    res.render('pages/doseGuidance', { drugArrayKey: model.allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: model.drugsWithIndications, CrClKey: crcl, doseRecKey: doseRecArray })
  })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
