const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

require('dotenv').config({path: '.env'});


const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport.js');
const { error } = require('console');

const app = express();

//Enable body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable handlebars as a view

app.engine('handlebars',
    exphbs.engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);

app.set('view engine', 'handlebars');

//Static files

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE})
}));

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Alerts and flash messages
app.use(flash());

//Create our own middleware
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});


//Field validation
app.use(expressValidator());


app.use('/', router());

//404 Not found page
app.use((req, res ,next) => {
    next(createError(404, 'Not found'));
});

//Error management
app.use((error, req, res, next) => {
    res.locals.message = error.message;
    res.render('error')
})

//Let Heroku assign the port

const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port,host, () => {
    console.log('The server is running');
});