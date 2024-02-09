const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacanciesController = require('../controllers/vacanciesController.js');
const usersController = require('../controllers/usersController.js');
const authController = require('../controllers/authController.js');


module.exports = () => {

    router.get('/', homeController.showJobs);

    //Create vacancies
    router.get('/vacancies/new', authController.verifyUser, vacanciesController.newVacancyForm);

    router.post('/vacancies/new',authController.verifyUser, vacanciesController.validateVacancy, vacanciesController.addVacancy);

    // Show vacancy (singular)
    router.get('/vacancies/:url', vacanciesController.showVacancy);

    // Edit vacancy
    router.get('/vacancies/edit/:url',authController.verifyUser, vacanciesController.formEditVacancy);

    router.post('/vacancies/edit/:url',authController.verifyUser, vacanciesController.validateVacancy, vacanciesController.editVacancy);

    // Delete vacancy

    router.delete('/vacancies/delete/:id', vacanciesController.deleteVacancy);

    // Create accounts

    router.get('/create-account', usersController.createAccountForm);

    router.post('/create-account', 
    usersController.validateRegistry,
    usersController.createAccount);

    //User authentication
    router.get('/log-in',usersController.formLogIn);
    router.post('/log-in',authController.authenticateUser);

    //Log out
    router.get('/log-out', authController.verifyUser, authController.logOut);

    //Reset password (emails)
    router.get('/recover-password', authController.recoverPasswordForm);
    router.post('/recover-password', authController.sendToken);

    //Reset password (Store it in the DB)
    router.get('/recover-password/:token', authController.restorePassword);
    router.post('/recover-password/:token', authController.savePassword);


    //Administration panel
    router.get('/management',authController.verifyUser, authController.showPanel);

    //Edit profile
    router.get('/edit-profile', authController.verifyUser, usersController.formEditProfile);
    
    router.post('/edit-profile',authController.verifyUser, 
        usersController.validateProfile,
        usersController.uploadImage, usersController.editProfile);

    //Receive candidates messages
    router.post('/vacancies/:url',vacanciesController.uploadCV, vacanciesController.contact);

    //Show the candidates by vacancy
    router.get('/candidates/:id',
    authController.verifyUser,
    vacanciesController.showCandidates
    );

    //Vacancy finder
    router.post('/search', vacanciesController.searchVacancies);


    return router;
};