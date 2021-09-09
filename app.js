var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');





let flash = require('express-flash');
let session = require('express-session');







var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
var cartRouter = require('./routes/cart') ;

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



app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books',/*authentication.isStaffAuthenticated,*/ booksRouter); // แล้วแต่ว่าจะใช้มั้ย
app.use('/cart', cartRouter);





app.post('/auth/google/callback',
console.log(req.body);
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



module.exports = app;
