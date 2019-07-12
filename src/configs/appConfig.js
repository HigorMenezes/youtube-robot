require('dotenv').config();

const appConfig = {
  port: process.env.APP_PORT || 3000,
};

module.exports = appConfig;
