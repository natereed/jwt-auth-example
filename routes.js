var express = require("express");
var passport = require("passport");
const jwt = require('jsonwebtoken');

var User = require("./user");
var router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

router.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

router.post("/login", passport.authenticate("login"), function(req, res) {
    // TODO - generate JWT
    res.status(200).send({"msg": "OK"});
});

router.post("/signup", async function(req, res, next) {

    var email = req.body.email;
    var password = req.body.password;

    await User.findOne({ email: email },  async function(err, user) {

        if (err) { return next(err); }
        if (user) {
            return res.status(409).send({message: "Duplicate user - already registered."});
        }

        var newUser = new User({
            email: email,
            password: password
        });
        await newUser.save(next);
        console.log("User saved...");
        return;
    });
    next();
    return;
    },
    passport.authenticate("login"),
    function(req, res) {
        return res.status(200).send({
            message: "Signup successful",
            user: req.user
        });
    }
);

module.exports = router;
