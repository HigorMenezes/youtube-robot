const videoCreateController = require('../controllers/videoCreateController');

const videoCreateRoute = app => {
  app.post('/video-create', videoCreateController.create);
};

module.exports = videoCreateRoute;
