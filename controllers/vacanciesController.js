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
