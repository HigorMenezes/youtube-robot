const gm = require('gm').subClass({ imageMagick: true });
const videoshow = require('videoshow');
const stateRobot = require('./stateRobot');

const videoshowConfig = require('../../configs/videoshowConfig');

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

          console.info(
            `[videoRobot - convertAllImages]: Image converted: ${outputFile}`,
          );
          return resolve();
        });
    } catch (error) {
      return reject(error);
    }
  });
}

async function convertAllImages(content) {
  console.info('[videoRobot - convertAllImages] Starting images conversion');
  const { sentences } = content;
  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex += 1
  ) {
    await convertImage(sentenceIndex);
  }
  console.info('[videoRobot - convertAllImages] Finished images conversion');
}

// async function createSentence(sentenceIndex, sentenceText) {
//   return new Promise((resolve, reject) => {
//     const outputFile = `./content/${sentenceIndex}-sentence.png`;
//     const templateSettings = {
//       0: {
//         size: '1920x400',
//         gravity: 'center',
//       },
//       1: {
//         size: '1920x1080',
//         gravity: 'center',
//       },
//       2: {
//         size: '800x1080',
//         gravity: 'west',
//       },
//       3: {
//         size: '1920x400',
//         gravity: 'center',
//       },
//       4: {
//         size: '1920x1080',
//         gravity: 'center',
//       },
//       5: {
//         size: '800x1080',
//         gravity: 'west',
//       },
//       6: {
//         size: '1920x400',
//         gravity: 'center',
//       },
//     };
//     try {
//       gm()
//         .out('-size', templateSettings[sentenceIndex].size)
//         .out('-gravity', templateSettings[sentenceIndex].gravity)
//         .out('-background', 'transparent')
//         .out('-fill', 'white')
//         .out('-kerning', '-1')
//         .out(`caption:${sentenceText}`)
//         .write(outputFile, error => {
//           if (error) {
//             return reject(error);
//           }

//           console.info(`videoRobot: Sentence created: ${outputFile}`);
//           return resolve();
//         });
//     } catch (error) {
//       return reject(error);
//     }
//   });
// }

// async function createAllSentences(content) {
//   const { sentences } = content;
//   for (
//     let sentenceIndex = 0;
//     sentenceIndex < sentences.length;
//     sentenceIndex += 1
//   ) {
//     await createSentence(sentenceIndex, sentences[sentenceIndex].text);
//   }
// }

async function createYouTubeThumbnail() {
  return new Promise((resolve, reject) => {
    try {
      gm()
        .in('./content/0-converted.png')
        .write('./content/youtube-thumbnail.jpg', error => {
          if (error) {
            return reject(error);
          }

          console.info(
            '[videoRobot - createYouTubeThumbnail]: YouTube Thumbnail created',
          );
          return resolve();
        });
    } catch (error) {
      return reject(error);
    }
  });
}

async function createVideo(content) {
  const { sentences } = content;
  const { options } = videoshowConfig;
  const images = [];
  for (
    let sentenceIndex = 0;
    sentenceIndex < sentences.length;
    sentenceIndex += 1
  ) {
    images.push({
      path: `./content/${sentenceIndex}-converted.png`,
      caption: sentences[sentenceIndex].text,
      loop: options.loop,
    });
  }
  return new Promise((resolve, reject) => {
    videoshow(images, options)
      .audio('./content/bensound-creativeminds.mp3')
      .save('./content/video.mp4')
      .on('start', command => {
        console.info(
          '[videoRobot - createVideo]: ffmpeg process started:',
          command,
        );
      })
      .on('end', () => {
        console.info('[videoRobot - createVideo]: Video created with success');
        return resolve();
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[videoRobot - createVideo] Error:', err);
        console.error('[videoRobot - createVideo] ffmpeg stderr:', stderr);
        reject();
      });
  });
}

async function videoRobot() {
  console.info('[videoRobot] Starting video robot');
  const content = stateRobot.load();
  await convertAllImages(content);
  // await createAllSentences(content);
  await createYouTubeThumbnail(content);

  await createVideo(content);

  stateRobot.save(content);
  console.info('[videoRobot] Finished video robot');
}

module.exports = videoRobot;
