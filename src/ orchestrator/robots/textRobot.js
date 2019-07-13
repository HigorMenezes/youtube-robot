const algorithmia = require('algorithmia');
const algorithmiaConfig = require('../../configs/algorithmiaConfig');

const fetchContentFromWikipedia = async content => {
  console.info(
    `Initializing research for content: ${JSON.stringify(content, null, 4)}`,
  );

  const algorithmiaAuthenticated = algorithmia(
    algorithmiaConfig.algorithmiaApiKey,
  );
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
    'web/WikipediaParser/0.1.2',
  );
  const wikipediaResponse = await wikipediaAlgorithm.pipe(content.term);
  const wikipediaContent = wikipediaResponse.get();

  console.info(
    'Wikipedia response: ',
    JSON.stringify(wikipediaContent.summary, null, 4),
  );

  return wikipediaContent;
};

const textRobot = async content => {
  console.info(
    `Content received with success: ${JSON.stringify(content, null, 4)}`,
  );
  const wikipediaContent = await fetchContentFromWikipedia(content);

  return wikipediaContent;
};

const sanitizeContent = content => {
  console.info(
    `Initializing sanitize for content: ${JSON.stringify(content, null, 4)}`,
  );
};
const breakContentIntoSentences = content => {
  console.info(
    `Initializing break content into sentence: ${JSON.stringify(
      content,
      null,
      4,
    )}`,
  );
};

module.exports = textRobot;
