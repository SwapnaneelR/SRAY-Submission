// background.js
// author : Swapnaneel Ray

const dotenv = require('dotenv');

dotenv.config();
const validApiKey = process.env.API_KEY;


console.log(validApiKey);
module.exports = validApiKey;