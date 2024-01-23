const mongoose = require("mongoose");
const Vacancy = mongoose.model('Vacancy');

exports.showJobs = async (req, res, next) => {

    const vacancies = await Vacancy.find().lean();

    if(!vacancies) return next();

    res.render('home',{
        namePage: 'LookPosting',
        tagline: 'Find and publish jobs for web developers',
        bar: true,
        button: true,
        vacancies
    });
};