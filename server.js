'use strict';

// resource: http://www.passportjs.org/docs/
// resource: https://auth0.com/docs/quickstart/webapp/nodejs#configure-node-js-to-use-auth0

// configs
require('dotenv').config();

// dependencies
const express = require('express');
const bodyParser = require('body-parser');
require('ejs');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var flash = require('connect-flash');
var session = require('express-session');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
const model = require('./models/model.js'); // data model
const db = require('./models/db.js'); // database

// configure Passport to use Auth0
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

// to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// initialize express app
const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(bodyParser.json());
let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(require('morgan')('combined'));
var sess = { secret: 'keyboard cat', cookie: {}, resave: false, saveUninitialized: true };
if (app.get('env') === 'production') {
  // Trust first proxy, to prevent "Unable to verify authorization request state."
  // errors with passport-auth0.
  // Ref: https://github.com/auth0/passport-auth0/issues/70#issuecomment-480771614
  // Ref: https://www.npmjs.com/package/express-session#cookiesecure
  app.set('trust proxy', 1);
  sess.cookie.secure = true; // serve secure cookies, requires https
}
app.use(session(sess));

app.use(express.urlencoded({ extended: true }));

// initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./public'));

app.use(flash());

// handle auth failure error messages
app.use(function (req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});

// configure view engine to render EJS templates.
app.set('view engine', 'ejs');
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

// Auth0 login and redirect to '/'
app.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

// Auth0 final stage of authentication and redirect to '/'
app.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('pages/login'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/');
    });
  })(req, res, next);
});

// session logout and redirect to homepage
app.get('/logout', (req, res) => {
  req.logout();

  var returnTo = req.protocol + '://' + req.hostname;
  var port = req.connection.localPort;
  if (port !== undefined && port !== 80 && port !== 443) {
    returnTo += ':' + port;
  }

  var logoutURL = new url.URL(
    util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
  );
  var searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: returnTo
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});

// get dose guidelines from database and render doseGuidance page
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
    var authorizedEmail = `"${process.env.AUTH0_USER}"`;
    res.render('pages/doseGuidance', { drugArrayKey: model.allDrugNames, selectedDrugKey: selectedDrug, drugsWithIndicationsKey: model.drugsWithIndications, CrClKey: crcl, doseRecKey: doseRecArray, user: req.user.emails[0].value, authUser: authorizedEmail })
  })
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
