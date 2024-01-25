const mongoose = require("mongoose");
const Vacancy = mongoose.model('Vacancy');


exports.newVacancyForm = (req, res) => {
    res.render('new-vacancy', {
        namePage: 'New Vacancy',
        tagline: 'Fill the form and publish your vacancy'
    });
}

//Add the vacancies to the database

exports.addVacancy = async (req, res) => {
    const vacancy = new Vacancy(req.body);

    //Create an array of skills
    vacancy.skills = req.body.skills.split(',');

    //Store it in the database

    const newVacancy = await vacancy.save();

    //Redirect
    res.redirect(`/vacancies/${newVacancy.url}`);
}

// Show a vacancy

exports.showVacancy = async (req, res, next) => {
    const vacancy = await Vacancy.findOne({url: req.params.url}).lean();

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
        namePage: `Edit - ${vacancy.title}`
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