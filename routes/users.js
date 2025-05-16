const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const authenticate = require('../authenticate'); // <-- Add this line

const router = express.Router();

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
    .then(users => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch(err => next(err));
});


// Signup route
router.post('/signup', (req, res) => {
  const user = new User({ username: req.body.username });

  User.register(user, req.body.password)
      .then(registeredUser => {
          if (req.body.firstname) {
              registeredUser.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
              registeredUser.lastname = req.body.lastname;
          }
          return registeredUser.save();
      })
      .then(() => {
          passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
          });
      })
      .catch(err => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
      });
});

// Login route using JWT
router.post(
  '/login',
  passport.authenticate('local', { session: false }), // <- disable sessions
  (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id }); // <- create token
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token: token,
      status: 'You are successfully logged in!',
    });
  }
);

// Optional logout route (only applies if using sessions, not JWT)
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('session-id');
      res.redirect('/');
    });
  } else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
