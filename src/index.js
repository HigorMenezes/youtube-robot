const appConfig = require('./configs/appConfig');
const app = require('./app');

const server = app.listen(appConfig.port, () => {
  console.info(`Server is running on port ${appConfig.port}`);
});

server.timeout = 600000;
