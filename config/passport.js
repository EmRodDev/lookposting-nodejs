const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = require('../models/Users');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    const user = await Users.findOne({email});

    if(!user) return done(null, false, {
        message: 'The user does not exist'
    });

    //The user exist, verify it
    const verifyPassword = user.comparePasswords(password);

    if(!verifyPassword) return done(null,false, {
        message: 'Wrong password'
    });

    //User exists and the password is correct

    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
    const user = await Users.findById(id);

    return done(null, user);

});

module.exports = passport;