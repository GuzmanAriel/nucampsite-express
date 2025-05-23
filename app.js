var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const session = require('express-session');
const FileStore = require('session-file-store')(session);

const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const config = require('./config');
const url = config.mongoUrl;
const connect = mongoose.connect(url, {});
const passport = require('passport');
const authenticate = require('./authenticate');
const uploadRouter = require('./routes/uploadRouter');


connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
      return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Logging and body parsers (must come before routes)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); // Uncomment if using cookies

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());



// Routes that should be accessible without auth (like /signup, /login)
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
