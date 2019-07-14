const google = require('googleapis');
const stateRobot = require('./stateRobot');

const googleConfig = require('../../configs/googleConfig');

const customSearch = new google.customsearch_v1.Customsearch();

async function fetchGoogleAndReturnImageLinks(query) {
  const response = await customSearch.cse.list({
    auth: googleConfig.apiKey,
    cx: googleConfig.searchEngineId,
    q: query,
    searchType: 'image',
    num: 2,
  });

  const imageUrls = response.data.items.map(item => {
    return item.link;
  });

  return imageUrls;
}

async function imageRobot() {
  const content = stateRobot.load();

  console.dir(await fetchGoogleAndReturnImageLinks('Michael Jackson'), {
    depth: null,
  });

  process.exit(0);
}

module.exports = imageRobot;
