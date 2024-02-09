require('dotenv');

const {EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT} = process.env;

module.exports = {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
    host: EMAIL_HOST,
    port: EMAIL_PORT
}
