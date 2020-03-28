'use strict';

// resource: http://www.passportjs.org/docs/
// configs
require('dotenv').config();

// dependencies
const express = require('express');
const bodyParser = require('body-parser');
require('ejs');
var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy;
const model = require('./models/model.js'); // data model
const db = require('./models/db.js'); // database
var users = require('./models/users');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
  function(username, password, cb) {
    users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password !== password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// initialize express app
const app = express();

const PORT = process.env.PORT || 3000;

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(bodyParser.json());
let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(require('morgan')('combined'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// routing
app.use(express.static('./public'));
// Configure view engine to render EJS templates.
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

app.get('/', homePage);
app.get('/about', aboutPage);
app.get('/technical', techDocPage);
app.get('/resources', resourcesPage);
app.get('/login', loginPage);

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

function loginPage(req, res) {
  res.render('pages/login');
}

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: false })
);

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
    if (req.user) {
      console.log('USER: ' + req.user.username);
    }
    res.render('pages/doseGuidance', { drugArrayKey: model.allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: model.drugsWithIndications, CrClKey: crcl, doseRecKey: doseRecArray, user: req.user })
  })
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
