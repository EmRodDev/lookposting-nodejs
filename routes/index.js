const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacanciesController = require('../controllers/vacanciesController.js');


module.exports = () => {

    router.get('/', homeController.showJobs);

    //Create vacancies
    router.get('/vacancies/new', vacanciesController.newVacancyForm);

    router.post('/vacancies/new',vacanciesController.addVacancy);

    return router;
};