var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var util = require('util');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let flash = require('express-flash');
let session = require('express-session');
let mysql = require('mysql');
let connection = require('./lib/db');



// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: "315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com",
  clientSecret: "RQTQczWyU3mkerQ4lcZ7dSLM",
  callbackURL: "https://kmuttonlinebookstore.me/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session related task & passport intiallization...
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  cookie: { maxAge: 60000 },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}))

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);

// Using FacebookStrategy within Passport here to perform the actual task...
/* GOOGLE ROUTER */
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    console.log(req.user._json.email);
    res.redirect('/');
  });

app.get('/test', function (req, res) {
 console.log(req.user);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
