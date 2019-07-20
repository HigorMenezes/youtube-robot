const videoCreateController = require('../controllers/videoCreateController');

const videoCreateRoute = app => {
  app.post('/video-create', videoCreateController.create);
  app.get('/credential', videoCreateController.credential);
  app.get('/youtube-auth', videoCreateController.youTubeAuthCode);
};

module.exports = videoCreateRoute;
