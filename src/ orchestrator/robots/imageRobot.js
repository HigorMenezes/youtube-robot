const google = require('googleapis');
const imageDownloader = require('image-downloader');
const stateRobot = require('./stateRobot');

const googleConfig = require('../../configs/googleConfig');

const customSearch = new google.customsearch_v1.Customsearch();

async function fetchGoogleAndReturnImageLinks(query) {
  const response = await customSearch.cse.list({
    auth: googleConfig.googleSearch.apiKey,
    cx: googleConfig.googleSearch.searchEngineId,
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
  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex += 1
  ) {
    let query;
    if (sentenceIndex === 0) {
      query = `${content.term}}`;
    } else {
      query = `${content.term} ${sentences[sentenceIndex].keywords[0]}`;
    }

    result.push({
      ...sentences[sentenceIndex],
      images: await fetchGoogleAndReturnImageLinks(query),
    });
  }
  return result;
}
async function downloadAndSaveImage(url, fileName) {
  return imageDownloader.image({
    url,
    dest: `./content/${fileName}`,
  });
}
async function downloadAllImages(content) {
  const { sentences } = content;
  const downloadedImages = [];

  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex += 1
  ) {
    const { images } = sentences[sentenceIndex];
    for (let imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
      const imageUrl = images[imageIndex];

      try {
        if (downloadedImages.includes(imageUrl)) {
          throw new Error('This image has already been downloaded');
        }

        await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`);
        downloadedImages.push(imageUrl);
        console.info(
          `imageRobot: [${sentenceIndex}][${imageIndex}] Image download complete with success: ${imageUrl}`,
        );
        break;
      } catch (error) {
        console.error(
          `imageRobot: [${sentenceIndex}][${imageIndex}] Error during image download: ${imageUrl} ${error}`,
        );
      }
    }
  }
}

async function imageRobot() {
  const content = stateRobot.load();
  content.sentences = await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);
  stateRobot.save(content);
}

module.exports = imageRobot;
