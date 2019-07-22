const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const watsonConfig = require('../../configs/watsonConfig');
const algorithmiaConfig = require('../../configs/algorithmiaConfig');
const stateRobot = require('./stateRobot');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonConfig.apiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/',
});

async function fetchContentFromWikipedia(content) {
  console.info(
    '[textRobot - fetchContentFromWikipedia] Starting fetch from wikipedia',
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
    '[textRobot - fetchContentFromWikipedia] Finished fetch from wikipedia',
  );
  return wikipediaContent.content;
}

async function sanitizeContent(content) {
  console.info('[textRobot - sanitizeContent] Starting sanitize content');
  const { wikipediaContent } = content;

  const contentSanitized = wikipediaContent
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
  console.info('[textRobot - sanitizeContent] Finished sanitize content');
  return contentSanitized;
}

async function breakContentIntoSentences(content) {
  console.info(
    '[textRobot - breakContentIntoSentences] Starting break content in sentences',
  );
  const { wikipediaContentSanitized } = content;
  const sentences = sentenceBoundaryDetection.sentences(
    wikipediaContentSanitized,
  );
  console.info(
    '[textRobot - breakContentIntoSentences] Finished break content in sentences',
  );
  return sentences;
}

function limitMaximumSentences(content) {
  console.info(
    '[textRobot - limitMaximumSentences] Limiting maximum sentences',
  );
  const { sentences } = content;
  return sentences.slice(0, 10);
}

async function fetchWatsonAndReturnKeywords(sentence) {
  console.info(
    '[textRobot - fetchWatsonAndReturnKeywords] Starting fetch watson keywords',
  );
  const watsonAnalyzedResponse = await nlu.analyze({
    text: sentence,
    features: {
      keywords: {},
    },
  });
  const keywords = watsonAnalyzedResponse.keywords.map(keyword => {
    return keyword.text;
  });
  console.info(
    '[textRobot - fetchWatsonAndReturnKeywords] Finished fetch watson keywords',
  );
  return keywords;
}

async function buildFinalSentencesObject(content) {
  console.info(
    '[textRobot - buildFinalSentencesObject] Starting build final sentences object',
  );
  const { sentences } = content;
  const result = [
    {
      text: `${content.prefix} - ${content.term}`,
      keywords: [content.prefix],
      images: [],
    },
  ];
  for (let index = 0; index < sentences.length; index += 1) {
    result.push({
      text: sentences[index],
      keywords: await fetchWatsonAndReturnKeywords(sentences[index]),
      images: [],
    });
  }
  console.info(
    '[textRobot - buildFinalSentencesObject] Finished build final sentences object',
  );
  return result;
}

async function textRobot() {
  console.info('[textRobot] Starting text robot');
  const content = stateRobot.load();
  content.wikipediaContent = await fetchContentFromWikipedia(content);
  content.wikipediaContentSanitized = await sanitizeContent(content);
  content.sentences = await breakContentIntoSentences(content);
  content.sentences = limitMaximumSentences(content);
  content.sentences = await buildFinalSentencesObject(content);

  stateRobot.save(content);
  console.info('[textRobot] Finished text robot');
}

module.exports = textRobot;
