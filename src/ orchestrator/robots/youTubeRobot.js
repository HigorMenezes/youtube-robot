const { google } = require('googleapis');
const fs = require('fs');
const stateRobot = require('./stateRobot');
const googleConfig = require('../../configs/googleConfig');

const { OAuth2 } = google.auth;
const youTube = google.youtube({ version: 'v3' });

async function requestGoogleForAccessToken(OAuthClient, authorizationToken) {
  return new Promise((resolve, reject) => {
    OAuthClient.getToken(authorizationToken, (error, tokens) => {
      if (error) {
        return reject(error);
      }

      console.info(
        '[youTubeRobot - requestGoogleForAccessToken] Access tokens received',
      );

      OAuthClient.setCredentials(tokens);
      resolve();
    });
  });
}

async function setGlobalGoogleAuthentication(OAuthClient) {
  google.options({
    auth: OAuthClient,
  });
}

async function authenticationWithOAuth(content) {
  const OAuthClient = new OAuth2(
    googleConfig.youTube.clientId,
    googleConfig.youTube.clientSecret,
    googleConfig.youTube.redirectUris[0],
  );
  await requestGoogleForAccessToken(OAuthClient, content.code);
  await setGlobalGoogleAuthentication(OAuthClient);
}

async function uploadVideo(content) {
  const videoFilePath = './content/video.mp4';
  const videoFileSize = fs.statSync(videoFilePath).size;
  const videoTitle = `${content.prefix} ${content.term}`;
  const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
  const videoDescription = content.sentences
    .map(sentence => {
      return sentence.text;
    })
    .join('\n\n');

  const requestParameters = {
    part: 'snippet, status',
    requestBody: {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: videoTags,
      },
      status: {
        privacyStatus: 'unlisted',
      },
    },
    media: {
      body: fs.createReadStream(videoFilePath),
    },
  };

  const youTubeResponse = await youTube.videos.insert(requestParameters, {
    // eslint-disable-next-line no-use-before-define
    onUploadProgress,
  });

  console.info(
    `[youTubeRobot - uploadVideo] Video available at: https://youtu.be/${youTubeResponse.data.id}`,
  );
  return youTubeResponse.data;

  function onUploadProgress(event) {
    const progress = Math.round((event.bytesRead / videoFileSize) * 100);
    console.info(`[youTubeRobot - onUploadProgress] ${progress}% completed`);
  }
}

// async function uploadThumbnail(videoInformation) {
//   const videoId = videoInformation.id;
//   const videoThumbnailFilePath = './content/youtube-thumbnail.jpg';

//   const requestParameters = {
//     videoId,
//     media: {
//       mimeType: 'image/jpeg',
//       body: fs.createReadStream(videoThumbnailFilePath),
//     },
//   };

//   await youTube.thumbnails.set(requestParameters);
//   console.info('Thumbnail uploaded');
// }

async function youTubeRobot() {
  console.info('[youTubeRobot] Starting youtube robot');
  const content = stateRobot.load();

  await authenticationWithOAuth(content);
  const videoInformation = await uploadVideo(content);
  content.videoUrl = `https://youtu.be/${videoInformation.id}`;
  stateRobot.save(content);
  console.info('[youTubeRobot] - video information ->', videoInformation);
  // await uploadThumbnail(videoInformation);
}

module.exports = youTubeRobot;
