const textRobot = require('./robots/textRobot');
const imageRobot = require('./robots/imageRobot');
const stateRobot = require('./robots/stateRobot');

const orchestrator = async content => {
  // stateRobot.save(content);
  // await textRobot();
  await imageRobot();

  const finalContent = stateRobot.load();
  console.dir(finalContent, { depth: null });
  return { sentences: finalContent.sentences };
};

module.exports = orchestrator;
