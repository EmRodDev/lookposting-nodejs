const mongoose = require("mongoose");
const Vacancy = mongoose.model('Vacancy');
const multer = require('multer');
const shortid = require('shortid');

exports.newVacancyForm = (req, res) => {
    res.render('new-vacancy', {
        namePage: 'New Vacancy',
        tagline: 'Fill the form and publish your vacancy',
        log_out: true,
        name: req.user.name,
        image: req.user.image
    });
}

//Add the vacancies to the database

exports.addVacancy = async (req, res) => {
    const vacancy = new Vacancy(req.body);

    //Author of the vacancy
    vacancy.author = req.user._id;

    //Create an array of skills
    vacancy.skills = req.body.skills.split(',');

    //Store it in the database

    const newVacancy = await vacancy.save();

    //Redirect
    res.redirect(`/vacancies/${newVacancy.url}`);
}

// Show a vacancy

exports.showVacancy = async (req, res, next) => {
    const vacancy = await Vacancy.findOne({url: req.params.url}).populate('author').lean();
    //If no results
    if(!vacancy) return next();

    res.render('vacancy', {
        vacancy,
        namePage : vacancy.title,
        bar: true
    })
}

exports.formEditVacancy = async (req, res, next) => {
    const vacancy = await Vacancy.findOne({url: req.params.url}).lean();

    //If no results
    if(!vacancy) return next();

    res.render('edit-vacancy', {
        vacancy,
        namePage: `Edit - ${vacancy.title}`,
        log_out: true,
        name: req.user.name,
        image: req.user.image

    })
}

exports.editVacancy = async (req, res) => {
    const updatedVacancy = req.body;

    updatedVacancy.skills = req.body.skills.split(',');

    const vacancy = await Vacancy.findOneAndUpdate({url: req.params.url}, updatedVacancy, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacancies/${vacancy.url}`);
}

//Validate and sanitize the new vacancy fields

exports.validateVacancy = (req, res, next) => {
    //Sanitize the fields
    req.sanitizeBody('title').escape();
    req.sanitizeBody('company').escape();
    req.sanitizeBody('location').escape();
    req.sanitizeBody('salary').escape();
    req.sanitizeBody('contract').escape();
    req.sanitizeBody('skills').escape();

    //Validate
    req.checkBody('title', 'Add a title to the vacancy').notEmpty();
    req.checkBody('company', 'Add a company to the vacancy').notEmpty();
    req.checkBody('location', 'Add a location to the vacancy').notEmpty();
    req.checkBody('contract', 'Select the type of the contract').notEmpty();
    req.checkBody('skills', 'Select at least one skill').notEmpty();

    const errors = req.validationErrors();

    if(errors){
        //Reload the view with the errors
        req.flash('error', errors.map(error => error.msg));

        res.render('new-vacancy', {
            namePage: 'New Vacancy',
            tagline: 'Fill the form and publish your vacancy',
            log_out: true,
            name: req.user.name,
            messages: req.flash()
        });
    }else{
        next(); //Next middleware
    }



}

exports.deleteVacancy = async (req, res) => {
    const {id} = req.params;

    const vacancy = await Vacancy.findById(id);

    if(verifyAuthor(vacancy, req.user)){
        //All good, it is the user, delete
        await vacancy.deleteOne();
        res.status(200).send('Vacancy succesfully deleted');
    }else{
        //Not allowed
        res.status(403).send('Error');

    }


}

const verifyAuthor = (vacancy = {}, user = {}) => {
    if(!vacancy.author.equals(user._id)){
        return false
    }
    return true;
}

//Upload PDF files
exports.uploadCV = (req, res, next) => {
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
            res.redirect('back');
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
            cb(null,__dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf') {
            //The callback is executed as true or false : true when the image is accepted
            cb(null, true);
        } else {
            cb(new Error('File format not valid'), false);
        }
    }
}

const upload = multer(multerConfig).single('cv');

//Store the candidates on the database

exports.contact = async (req,res,next) => {
    const vacancy = await Vacancy.findOne({url: req.params.url});

    //If the vacancy does not exist
    if(!vacancy) return next();

    //All good, build the new object
    const newCandidate = {
        name: req.body.name,
        email: req.body.email,
        cv: req.file.filename
    }

    //Store the vacancy
    vacancy.candidates.push(newCandidate);
    await vacancy.save();

    //Flash message and redirect
    req.flash('correct', 'Your CV was sent successfully');
    res.redirect('/');
}

exports.showCandidates = async (req, res, next) => {
    const vacancy = await Vacancy.findById(req.params.id).lean();
    if(vacancy.author != req.user._id.toString()){
        return next();
    }
    if(!vacancy) return next();

    res.render('candidates', {
        namePage: `Vacancy candidates - ${vacancy.title}`,
        logOut: true,
        name: req.user.name,
        image: req.user.image,
        candidates: vacancy.candidates
    })
};

//Vacancy finder

exports.searchVacancies = async (req, res) => {
    const vacancies = await Vacancy.find({
        $text: {
            $search: req.body.q
        }
    }).lean();
    //Show the vacancies
    res.render('home', {
        namePage: `Results from the search: ${req.body.q}`,
        bar: true,
        vacancies
    })
};