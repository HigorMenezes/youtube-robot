const textRobot = require('./robots/textRobot');

const orchestrator = async content => {
  const orchestratorResponse = await textRobot(content);

  return orchestratorResponse;
};

module.exports = orchestrator;
