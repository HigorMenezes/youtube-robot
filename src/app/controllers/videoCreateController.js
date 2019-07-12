const videoCreateConfig = require('../../configs/videoCreateConfig');

const videoCreateController = {
  create: async (req, res) => {
    try {
      if (req && req.body && req.body.term && req.body.prefix) {
        const { term, prefix } = req.body;
        if (videoCreateConfig.prefixes.includes(prefix)) {
          return res.send({
            code: 200,
            message: 'Video created with success',
            content: {
              request: {
                term,
                prefix,
              },
            },
          });
        }
        return res.send({
          code: 400,
          message: 'Bad request - videoCreate',
          content: {
            message: 'Selected prefix does not exist',
            prefixesAvailable: videoCreateConfig.prefixes,
            prefixSelected: prefix,
          },
        });
      }
      return res.send({
        code: 400,
        message: 'Bad request - videoCreate',
        content: {
          message: 'Some data are missing',
        },
      });
    } catch (error) {
      return res.send({
        code: 500,
        message: 'Server error - videoCreate',
      });
    }
  },
};

module.exports = videoCreateController;
