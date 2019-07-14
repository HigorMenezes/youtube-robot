require('dotenv').config();

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  apiKey: process.env.GOOGLE_API_KEY,
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
};

module.exports = googleConfig;
