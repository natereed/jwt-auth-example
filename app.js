var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var setUpPassport = require("./auth");
var session = require("express-session");

var app = express();
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/test");
setUpPassport();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "TlK4tZy9fTa{u\".iE9:/7Bf8aihMm1ja=y(MRV)cjvOfxf0*Z#!7_u@6g:GZD<6",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
const accessTokenSecret = 'youraccesstokensecret';

var routes= require('./routes');
var secureRoutes = require("./secure-routes");

// Plug in the JWT strategy as a middleware so only verified users can access this route.
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoutes);

// Handle errors.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err });
});

app.use('/', routes);

module.exports = app;
