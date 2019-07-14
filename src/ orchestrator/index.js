const textRobot = require('./robots/textRobot');
const stateRobot = require('./robots/stateRobot');

const orchestrator = async content => {
  stateRobot.save(content);
  await textRobot();

  const finalContent = stateRobot.load();
  console.dir(finalContent, { depth: null });
  return { sentences: finalContent.sentences };
};

module.exports = orchestrator;
