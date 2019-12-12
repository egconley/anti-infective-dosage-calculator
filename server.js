'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const cors = require('cors');
require('ejs');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.set('views', __dirname + '/public/views');

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/', homePage);

function homePage(req, res) {
  res.render('pages/index', { drugArrayKey: allDrugNames });
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Database queries
// http://zetcode.com/javascript/nodepostgres/

// express and exports - modularization and passing variables between js files
// from https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
// // In app.js:
// app.locals.variable_you_need = 42;

// // In index.js
// exports.route = function(req, res){
//     var variable_i_needed = req.app.locals.variable_you_need;
// }
// app.locals documentation
// http://expressjs.com/en/api.html#app.locals
// artile to read: https://www.sitepoint.com/understanding-module-exports-exports-node-js/

let allDrugNames = [];
function Drug(drug) {
  this.drug_name = drug;
  allDrugNames.push(this);
}

client.query('SELECT drug_name FROM anti_microbial_drugs ORDER BY drug_name').then(res => {

  // const fields = res.fields.map(field => field.name);
  const drug_names = res.rows.map(name => name.drug_name);
  drug_names.forEach(drug_name => {
    new Drug(drug_name);
  })

}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  client.end()
});
