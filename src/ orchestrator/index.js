const textRobot = require('./robots/textRobot');
const imageRobot = require('./robots/imageRobot');
const stateRobot = require('./robots/stateRobot');
const videoRobot = require('./robots/videoRobot');
const youTubeRobot = require('./robots/youTubeRobot');

const orchestrator = async content => {
  console.info('[orchestrator] Starting orchestrator');
  stateRobot.save(content);
  await textRobot();
  await imageRobot();
  await videoRobot();
  await youTubeRobot();

  const finalContent = stateRobot.load();
  console.info('[orchestrator] Finishing orchestrator');
  return { sentences: finalContent.sentences, videoUrl: finalContent.videoUrl };
};

module.exports = orchestrator;
