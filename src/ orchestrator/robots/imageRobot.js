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

async function fetchImagesOfAllSentences(content) {
  const { sentences } = content;
  const result = [];
  for (let index = 0; index < sentences.length; index += 1) {
    const query = `${content.term} ${sentences[index].keywords[0]}`;
    result.push({
      ...sentences[index],
      images: await fetchGoogleAndReturnImageLinks(query),
    });
  }
  return result;
}

async function imageRobot() {
  const content = stateRobot.load();
  content.sentences = await fetchImagesOfAllSentences(content);
  stateRobot.save(content);
}

module.exports = imageRobot;
