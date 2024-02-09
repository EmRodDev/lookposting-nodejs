const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const { validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.uploadImage = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError) {
                if(error.code === "LIMIT_FILE_SIZE"){
                    req.flash('error','The file is too large: Maximum file size 100kb')
                } else {
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message);
                
            }
            res.redirect('/management');
            return;
        } else {
            return next();
        }
    });
    
}

//Multer options
const multerConfig = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,__dirname+'../../public/uploads/profiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //The callback is executed as true or false : true when the image is accepted
            cb(null, true);
        } else {
            cb(new Error('File format not valid'), false);
        }
    }
}

const upload = multer(multerConfig).single('image');

exports.createAccountForm = (req, res) => {
    res.render('create-account', {
        namePage: 'Create your account on LookPosting',
        tagline: 'Begin with your vacancy uploads completely free, you just have to create an account'
    })
}



exports.validateRegistry = (req, res, next) => {
    //Sanitize
    req.sanitizeBody('name').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirm').escape();

    //Validate
    req.checkBody('name', 'The name is required').notEmpty();
    req.checkBody('email', 'The email has to be valid').isEmail();
    req.checkBody('password', 'The password cannot be empty').notEmpty();
    req.checkBody('confirm', 'The password confirmation cannot be empty').notEmpty();
    req.checkBody('confirm', 'The password fields are different').equals(req.body.password);


    
    const errors = req.validationErrors();
    if(errors){
    //If there are errors
        req.flash('error', errors.map(error => error.msg));
        res.render('create-account', {
            namePage: 'Create your account on LookPosting',
            tagline: 'Begin with your vacancy uploads completely free, you just have to create an account',
            messages: req.flash()
        })
    }
    else{
        next();
    }

    
}

exports.createAccount = async(req,res,next) => {

    //Create user
    const user = new Users(req.body);

    try {

        await user.save();
        res.redirect('/log-in');

    } catch (error){
        req.flash('error', error);
        res.redirect('/create-account');
    }

}

//Log in form

exports.formLogIn = (req, res) => {
    res.render('log-in', {
        namePage : 'Log in on LookPosting'
    })
}

//Edit profile

exports.formEditProfile = (req, res) => {
    const user = req.user.toObject();

    res.render('edit-profile',{
        namePage: 'Edit your profile in LookPosting',
        user,
        log_out: true,
        name: req.user.name

    })
}

//Save changes edit profile

exports.editProfile = async(req, res) => {
    const user = await Users.findById(req.user._id);
    
    user.name = req.body.name;
    user.email = req.body.email;

    if(req.file){
        user.image = req.file.filename;
    }

    if(req.body.password){
        user.password = req.body.password;
    }

    

    await user.save();

    req.flash('correct', 'Changes saved correctly');

    res.redirect('/management');
}

//Sanitize and validate the edit profile form

exports.validateProfile = async (req, res, next) => {
    const user = await Users.findById(req.user._id).lean();


    //Sanitize
    req.sanitizeBody(req.body.name).escape();
    req.sanitizeBody(req.body.email).escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }
    //Validate
    req.checkBody(req.body.name, 'The name cannot be empty').notEmpty();
    req.checkBody(req.body.email, 'The email cannot be empty').notEmpty();

    const errors = req.validationErrors();

    if(errors){
        req.flash('error',errors.map(error => error.msg));

        res.render('edit-profile',{
            namePage: 'Edit your profile in LookPosting',
            user,
            log_out: true,
            name: req.user.name,
            messages: req.flash(),
            image: req.user.image
        })
    }else{
        next(); //All good, next middleware
    }

}