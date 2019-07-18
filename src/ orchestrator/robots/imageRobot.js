const google = require('googleapis');
const imageDownloader = require('image-downloader');
const gm = require('gm').subClass({ imageMagick: true });
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

async function convertImage(sentenceIndex) {
  return new Promise((resolve, reject) => {
    const inputFile = `./content/${sentenceIndex}-original.png[0]`;
    const outputFile = `./content/${sentenceIndex}-converted.png`;
    const width = 1920;
    const height = 1080;
    try {
      gm()
        .in(inputFile)
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-blur', '0x9')
        .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
        .out('-clone')
        .out('0')
        .out('-background', 'white')
        .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, error => {
          if (error) {
            return reject(error);
          }

          console.log(`imageRobot: Image converted: ${outputFile}`);
          resolve();
        });
    } catch (error) {
      reject(error);
    }
  });
}

async function convertAllImages(content) {
  const { sentences } = content;
  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex += 1
  ) {
    await convertImage(sentenceIndex);
  }
}

async function imageRobot() {
  const content = stateRobot.load();
  // content.sentences = await fetchImagesOfAllSentences(content);
  // await downloadAllImages(content);
  await convertAllImages(content);
  // stateRobot.save(content);
}

module.exports = imageRobot;
