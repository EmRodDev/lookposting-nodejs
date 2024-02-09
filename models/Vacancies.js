const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const slug = require('slug');
const shortid = require('shortid');

const vacacanciesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'The name of the vacancy is required',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true,
        required: 'The location is required'
    },
    salary: {
        type: String,
        default: 0,
        trim: true
    },
    contract: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidates: [{
        name: String,
        email: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: 'The author is required'
    }
});

vacacanciesSchema.pre('save', function(next) {

    //Create the url
    const url = slug(this.title);
    this.url = `${url}-${shortid.generate()}`;

    next();
});

//Create an index

vacacanciesSchema.index({title: 'text'});

module.exports = mongoose.model('Vacancy', vacacanciesSchema);