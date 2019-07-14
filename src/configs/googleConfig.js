require('dotenv').config();

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  apiKey: process.env.GOOGLE_API_KEY,
};

module.exports = googleConfig;
