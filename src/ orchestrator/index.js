const textRobot = require('./robots/textRobot');
const imageRobot = require('./robots/imageRobot');
const stateRobot = require('./robots/stateRobot');
const videoRobot = require('./robots/videoRobot');
const youTubeRobot = require('./robots/youTubeRobot');

const orchestrator = async content => {
  console.info('Starting orchestrator');
  // stateRobot.save(content);
  // await textRobot();
  // await imageRobot();
  // await videoRobot();
  await youTubeRobot();

  const finalContent = stateRobot.load();
  return { sentences: finalContent.sentences };
};

module.exports = orchestrator;
