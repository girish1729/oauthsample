/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');

var FacebookStrategy = require('passport-facebook')
    .Strategy;
var GoogleStrategy = require('passport-google')
    .Strategy;

var FACEBOOK_APP_ID = '832584156772227';
var FACEBOOK_APP_SECRET = '850f603b98b45403aba37fc2831bf330';

var GOOGLE_APP_ID =
    '931991565540-japkh361k3fht0criosegohln6fg9ovt.apps.googleusercontent.com';
var GOOGLE_APP_SECRET = '6PU1I4y84JyvoFjsedMOvSu1';


var app = express();

// all environments

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


var facebook = {};
var gmail = {};

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
	console.log("Facebook user:" + profile.displayName);
	console.log("Facebook gender:" + profile.gender);
	console.log("Facebook primary e-mail:" + profile.emails[0].value);
	facebook.name = profile.displayName;
	facebook.gender = profile.gender;
	facebook.email = profile.emails[0].value;
        done(null, profile);
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/fbsuccess',
    failureRedirect: '/error'
}));

app.get('/fbsuccess', function (req, res, next) {
                res.render('fbprofile.ejs', {
                    "fbuser" : facebook
                });
});


passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:3000/auth/google/callback',
        realm: 'http://localhost:3000/'
    },
    function (identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            profile.identifier = identifier;
		console.log("Gmail display name:" + profile.displayName);
		console.log("Your gmail address:" + profile.emails[0].value);
	gmail.name = profile.displayName;
	gmail.email = profile.emails[0].value;
            return done(null, profile);
        });
    }
));


app.get('/auth/gmail', passport.authenticate('google'));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/googlesuccess',
        failureRedirect: '/login'
    }));

app.get('/googlesuccess', function (req, res, next) {
                res.render('gmailprofile.ejs', {
                     "guser" : gmail
                });
});

app.get('/error', function (req, res, next) {
    res.send("Error logging in.");
});

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/auth.html');
});

http.createServer(app)
    .listen(3000, function () {
        console.log('Express server listening on port 3000');
});
