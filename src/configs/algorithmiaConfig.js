require('dotenv').config();

const algorithmiaConfig = {
  algorithmiaApiKey: process.env.ALGORITHMIA_API_KEY,
};

module.exports = algorithmiaConfig;
