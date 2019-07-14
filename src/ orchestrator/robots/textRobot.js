const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const watsonConfig = require('../../configs/watsonConfig');
const algorithmiaConfig = require('../../configs/algorithmiaConfig');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonConfig.apiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/',
});

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

const breakContentIntoSentences = async content => {
  console.info('Initializing break content into sentence');
  const sentences = sentenceBoundaryDetection.sentences(content);
  return sentences;
};

const limitMaximumSentences = sentences => {
  console.info('Initializing limit maximum sentences');
  return sentences.slice(0, 7);
};

const fetchWatsonAndReturnKeywords = async sentence => {
  const watsonAnalyzedResponse = await nlu.analyze({
    text: sentence,
    features: {
      keywords: {},
    },
  });
  const keywords = watsonAnalyzedResponse.keywords.map(keyword => {
    return keyword.text;
  });

  return keywords;
};

const buildFinalSentencesObject = async sentences => {
  console.info('Initializing build final sentences object');
  const result = [];
  for (let index = 0; index < sentences.length; index += 1) {
    result.push({
      text: sentences[index],
      keywords: await fetchWatsonAndReturnKeywords(sentences[index]),
      images: [],
    });
  }
  return result;
};

const textRobot = async content => {
  console.info(
    `Content received with success: ${JSON.stringify(content, null, 4)}`,
  );
  const wikipediaContent = await fetchContentFromWikipedia(content);
  const wikipediaContentSanitized = await sanitizeContent(wikipediaContent);
  let sentences = await breakContentIntoSentences(wikipediaContentSanitized);
  sentences = limitMaximumSentences(sentences);
  sentences = await buildFinalSentencesObject(sentences);

  return {
    ...content,
    sourceContentOriginal: wikipediaContent.content,
    sourceContentSanitized: wikipediaContentSanitized,
    sentences,
  };
};

module.exports = textRobot;
