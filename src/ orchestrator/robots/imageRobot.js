const google = require('googleapis');
const stateRobot = require('./stateRobot');

const googleConfig = require('../../configs/googleConfig');

const customSearch = new google.customsearch_v1.Customsearch();

async function imageRobot() {
  const content = stateRobot.load();

  const response = await customSearch.cse.list({
    auth: googleConfig.apiKey,
    cx: googleConfig.searchEngineId,
    q: 'Michael Jackson',
    num: 2,
  });

  console.dir(response, { depth: null });
  process.exit(0);
}

module.exports = imageRobot;
