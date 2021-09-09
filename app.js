var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com");
var passport = require('passport');





let flash = require('express-flash');
let session = require('express-session');







var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
var cartRouter = require('./routes/cart');

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

app.use(session({
  cookie: { maxAge: 60000 },
  saveUninitialized: true,
  resave: false,
  secret: 'secret'
}))

// session related task & passport intiallization...
app.use(passport.initialize());
app.use(passport.session());



app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books',/*authentication.isStaffAuthenticated,*/ booksRouter); // แล้วแต่ว่าจะใช้มั้ย
app.use('/cart', cartRouter);


// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });


app.post('/auth/google/callback', async (req, res, next) => {
    var test = await verify(req.body.id_token)
    console.log(test)
    passport.authenticate('local', function(err, user, info) {
        console.log(user)
    })(req, res, next);
  // function (req, res) {
  //   var allowedEmail = ["mail.kmutt.ac.th", "kmutt.ac.th"]

  //   if (!allowedEmail.includes(req.user.emails[0].value.split("@")[1])) {
  //     req.flash('error', 'Please use KMUTT Account');
  //     req.logout();
  //     return res.redirect('/');
  //   }
  //   console.log(req.user._json.email);
  //   res.redirect('/');
});




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

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: "315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  }
}

module.exports = app;
