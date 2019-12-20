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
  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrug: null });
}

let allDrugNames = [];
let selectedDrug;
let dose;

function Drug(drug) {
  this.drug_name = drug;
  allDrugNames.push(this);
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
  WHERE a.drug_name = $1
  ORDER BY drug_name;`,
    values: [`${selectedDrug}`],
  }
  client.query(doseQuery).then(res => {

    dose = res.rows[0].dose;
    console.log('dose info from database', dose)


  }).catch(err => {
    console.log(err.stack);
  }).finally(() => {
    // client.end()
  });
}

app.post('/postDrug', urlencodedParser, function (req, res) {
  console.log('post request successful!!')
  selectedDrug = req.body.drugs;
  console.log('req.body.drugs: ', selectedDrug);

  getDose();

  res.render('pages/index', { drugArrayKey: allDrugNames, selectedDrugKey: selectedDrug });
});

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
