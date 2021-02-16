

var express = require("express");
var passport = require("passport");
const jwt = require('jsonwebtoken');

const jwt_secret_key = 'eN}M<9(+^WkL:R,.&C,kw.jvn%Zq50dhlF2+?f}iJ<n!zPc?0^#,BwRd29TXddu';

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

// router.post("/login", passport.authenticate("login"), function(req, res) {
//     // TODO - generate JWT
//     res.status(200).send({"msg": "OK"});
// });

router.post(
    '/login',
    async (req, res, next) => {
        console.log("Logging in...");
        passport.authenticate(
            'login',
            async (err, user, info) => {

                console.log("Error: " + err);
                console.log("User:" + user);
                console.log("Info:" + info);
                try {
                    console.log("User: " + user);

                    if (err) {
                        console.log("An error occurred... returning next(error)")
                        const error = new Error('An error occurred.');

                        return next(error);
                    }

                    if (!user) {
                        return res.status(401).json({ "message": "No user found for username, password."})
                    }

                    req.login(
                        user,
                        { session: false }, // Should not store in session
                        async (error) => {
                            if (error) return next(error);

                            const body = { _id: user._id, email: user.email };
                            const token = jwt.sign({ user: body }, jwt_secret_key);

                            return res.json({ token });
                        }
                    );
                } catch (error) {
                    return next(error);
                }
            }
        )(req, res, next);
    }
);

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

router.get(
    '/profile',
    (req, res, next) => {
        res.json({
            message: 'You made it to the secure route',
            user: req.user,
            token: req.query.secret_token
        })
    }
);

module.exports = router;
