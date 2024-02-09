const passport = require('passport');
const mongoose = require('mongoose');
const Vacancies = mongoose.model('Vacancy');
const Users = mongoose.model('Users');
const crypto = require('crypto');
const sendEmail = require('../handlers/email.js');

exports.authenticateUser = passport.authenticate('local', {
    successRedirect: '/management',
    failureRedirect: '/log-in',
    failureFlash: true
});

//Check if the user is authenticated or not
exports.verifyUser = (req, res, next) => {
    //Check the user
    if(req.isAuthenticated()){
        return next(); //They're authenticated
    }

    //Redirect
    res.redirect('/log-in');
}

exports.showPanel = async (req, res) => {

    //Check the authenticated user

    const vacancies = await Vacancies.find({author: req.user._id}).lean();

    res.render('admin', {
        namePage: 'Administration panel',
        tagline: 'Create and manage your vacancies from here',
        log_out: true,
        name: req.user.name,
        image: req.user.image,
        vacancies
    })
}

exports.logOut = async (req, res) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash('correct', 'You logged out succesfully')
        return res.redirect('/log-in');
    });
}

//Password recovering form

exports.recoverPasswordForm = (req, res) => {
    res.render('recover-password', {
        namePage: 'Recover your password',
        tagline: 'If you already have an account but you forgot your password, put your email below'
    })
}

//Generate the token on the user's table
exports.sendToken = async (req, res) => {
    const user = await Users.findOne({email: req.body.email});

    if(!user){
        req.flash('error','There is no account associated with the email provided');
        return res.redirect('/recover-password');
    }

    //The user exists, generate token
    user.token = crypto.randomBytes(20).toString('hex');
    user.expires = Date.now() + 3600000;

    //Save the user
    await user.save();

    const resetUrl = `http://${req.headers.host}/recover-password/${user.token}`;

    //TODO: Send notification by email
    await sendEmail.send({
        user,
        subject : 'Reset your password',
        resetUrl,
        archive: 'reset'
    });

    req.flash('correct','Check your email for the indications')
    res.redirect('log-in');

}

//Validate if the token is valid and exists, show the view

exports.restorePassword = async (req, res) => {
    const user = await Users.findOne({
        token: req.params.token,
        expires: {
            $gt : Date.now()
        }
    });

    if(!user){
        req.flash('error','The form is not valid, try requesting a new password reset again');
        return res.redirect('/recover-password');
    }

    //All good, show the form
    res.render('new-password', {
        namePage: 'New Password'
    })
}

//Store the new password on the DB
exports.savePassword = async (req, res) => {
    const user = await Users.findOne({
        token: req.params.token,
        expires: {
            $gt : Date.now()
        }
    });

    if(!user){
        req.flash('error','The form is not valid, try requesting a new password reset again');
        return res.redirect('/recover-password');
    }

    //Assign new password, clean previous values
    user.password = req.body.password;
    user.token = undefined;
    user.expires = undefined;

    //Add and remove the values from the object
    await user.save();

    //Redirect
    req.flash('correct','Password Modified Successfully');
    res.redirect('/log-in');
}