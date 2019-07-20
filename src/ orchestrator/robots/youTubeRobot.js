const stateRobot = require('./stateRobot');
const googleConfig = require('../../configs/googleConfig');

async function uploadVideo() {}

async function youTubeRobot() {
  const content = stateRobot.load();

  // await uploadVideo();
  // await uploadThumbnail();

  // stateRobot.save(content);
}

module.exports = youTubeRobot;
