const google = require('googleapis');
const stateRobot = require('./stateRobot');

async function imageRobot() {
  const content = stateRobot.load();
}

module.exports = imageRobot;
