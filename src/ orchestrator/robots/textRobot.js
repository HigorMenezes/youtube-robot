const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');

const algorithmiaConfig = require('../../configs/algorithmiaConfig');

const fetchContentFromWikipedia = async content => {
  console.info('Initializing research for content');

  const algorithmiaAuthenticated = algorithmia(
    algorithmiaConfig.algorithmiaApiKey,
  );
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
    'web/WikipediaParser/0.1.2',
  );
  const wikipediaResponse = await wikipediaAlgorithm.pipe(content.term);
  const wikipediaContent = wikipediaResponse.get();

  return wikipediaContent.content;
};

const sanitizeContent = content => {
  console.info('Initializing sanitize for content');

  const contentSanitized = content
    .split('\n')
    .filter(line => {
      if (line.trim().length === 0 || line.trim().startsWith('=')) {
        return false;
      }
      return true;
    })
    .join(' ')
    .replace(/\(.*?\)/g, '')
    .replace(/( ){2,}/g, ' ');

  return contentSanitized;
};

const breakContentIntoSentences = content => {
  console.info('Initializing break content into sentence');
  const sentences = sentenceBoundaryDetection
    .sentences(content)
    .map(sentence => {
      return {
        text: sentence,
        keywords: [],
        images: [],
      };
    });

  return sentences;
};

const textRobot = async content => {
  console.info(
    `Content received with success: ${JSON.stringify(content, null, 4)}`,
  );

  const wikipediaContent = await fetchContentFromWikipedia(content);
  const wikipediaContentSanitized = await sanitizeContent(wikipediaContent);
  const sentences = breakContentIntoSentences(wikipediaContentSanitized);

  return {
    ...content,
    sourceContentOriginal: wikipediaContent.content,
    sourceContentSanitized: wikipediaContentSanitized,
    sentences,
  };
};

module.exports = textRobot;
