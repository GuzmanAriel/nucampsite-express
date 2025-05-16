const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

// Local strategy for username/password authentication
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// JWT and token setup
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // for creating and verifying tokens

const config = require('./config.js');

// Create a token from a user object
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); // token expires in 1 hour
};

// JWT strategy configuration
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // extract token from Bearer header
opts.secretOrKey = config.secretKey;

// JWT strategy definition
exports.jwtPassport = passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        console.log('JWT payload:', jwt_payload);

        User.findOne({ _id: jwt_payload._id })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch(err => done(err, false));
    })
);

// Middleware to protect routes
exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.admin) {
        return next(); // User is admin, allow to proceed
    } else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};