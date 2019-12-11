'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Database queries
// http://zetcode.com/javascript/nodepostgres/

client.query('SELECT * FROM anti_microbial_drugs').then(res => {

  const fields = res.fields.map(field => field.name);

  console.log(fields);

}).catch(err => {
  console.log(err.stack);
}).finally(() => {
  client.end()
});
