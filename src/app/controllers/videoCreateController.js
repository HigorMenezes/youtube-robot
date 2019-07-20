const { google } = require('googleapis');
const videoCreateConfig = require('../../configs/videoCreateConfig');
const googleConfig = require('../../configs/googleConfig');
const orchestrator = require('../../ orchestrator');

const { OAuth2 } = google.auth;

const videoCreateController = {
  create: async (req, res) => {
    try {
      if (
        req &&
        req.body &&
        req.body.term &&
        req.body.prefix &&
        req.body.code
      ) {
        const { term, prefix, code } = req.body;
        if (videoCreateConfig.prefixes.includes(prefix)) {
          const orchestratorResponse = await orchestrator({
            term,
            prefix,
            code,
          });
          return res.send({
            code: 200,
            message: 'Video created with success',
            content: {
              ...orchestratorResponse,
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
      console.error('Server error - videoCreate', error);
      return res.send({
        code: 500,
        message: 'Server error - videoCreate',
      });
    }
  },
  credential: (req, res) => {
    try {
      const OAuthClient = new OAuth2(
        googleConfig.youTube.clientId,
        googleConfig.youTube.clientSecret,
        googleConfig.youTube.redirectUris[0],
      );

      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube'],
      });

      res.send({
        code: 200,
        message: 'credential solicited with success',
        content: {
          link: consentUrl,
        },
      });
    } catch (error) {
      console.error('Server error - credential', error);
      return res.send({
        code: 500,
        message: 'Server error - credential',
      });
    }
  },
  youTubeAuthCode: (req, res) => {
    try {
      const { code } = req.query;
      res.send({
        code: 200,
        message: 'Code recovery with success',
        content: {
          code,
        },
      });
    } catch (error) {
      console.error('Server error - authYouTubeCode', error);
      return res.send({
        code: 500,
        message: 'Server error - authYouTubeCode',
      });
    }
  },
};

module.exports = videoCreateController;
