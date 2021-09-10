var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com");
var passport = require('passport');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;






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

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));

app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));




passport.serializeUser(function(user, done) {
  console.log("serialize", user)
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});


passport.use('custom', new CustomStrategy(
  function(req, done) {
  verify(req.body.id_token).then((e) => {
    done(null, e);
  })
}
));





app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books',/*authentication.isStaffAuthenticated,*/ booksRouter); // แล้วแต่ว่าจะใช้มั้ย
app.use('/cart', cartRouter);




app.post('/auth/google/callback', passport.authenticate('custom', { failureRedirect: "/" }), async (req, res, next) => {
  req.session.save(function(){
    res.redirect('/');
  });
  console.log("test1",req.user)
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



app.get('/test', function (req,res) {
  console.log("abcdefgh",req.user)
})

app.get('/logout', function (req, res) {
  req.session.destroy(null);
  res.clearCookie(this.cookie, { path: '/' });
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
