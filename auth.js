var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

// TODO: remove this duplication (it's also declared in routes.js).
const jwt_secret_key = 'eN}M<9(+^WkL:R,.&C,kw.jvn%Zq50dhlF2+?f}iJ<n!zPc?0^#,BwRd29TXddu';

var User = require("./user");

module.exports = function() {

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(
        new JWTstrategy(
            {
                secretOrKey: jwt_secret_key,
                jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
            },
            async (token, done) => {
                try {
                    return done(null, token.user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.use("login", new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        async (username, password, done) => {
            console.log("login...");
            console.log(username);
            console.log(password);

            User.findOne({ email: username }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: "User not found!" });
                }
                user.checkPassword(password, function(err, isMatch) {
                    console.log("Checked password...");
                    console.log("Error? Match?");
                    console.log(err);
                    console.log(isMatch);
                    if (err) { return done(err); }
                    if (isMatch) {
                        console.log("Returning done...");
                        return done(null, user, { message: 'Logged in Successfully' });
                    } else {
                        return done(null, false, { message: "Invalid password." });
                    }
                });
            });
        }));

    // passport.use('signup', new LocalStrategy(
    //     {
    //         usernameField: 'email',
    //         passwordField: 'password'
    //     },
    //     async (email, password, done) => {
    //         try {
    //             let user = await User.findOne({email: req.body.email});
    //             if (user) {
    //                 //res.send(409, {message: "Duplicate user."});
    //                 //next(null, false, {message: 'Duplicate user.'});
    //                 throw new Error("Duplicate user");
    //             }
    //             console.log("Creating user");
    //             console.log(email);
    //             console.log(password);
    //             user = await User.create({ email, password });
    //             return done(null, user);
    //         } catch (error) {
    //             done(error);
    //         }
    //     }
    // ))
};

