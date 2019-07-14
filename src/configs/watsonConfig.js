require('dotenv').config();

const watsonConfig = {
  apiKey: process.env.WATSON_API_KEY,
  iamApiKeyDescription: process.env.WATSON_IAM_API_KEY_DESCRIPTION,
  iamApiWayName: process.env.WATSON_IAM_API_KEY_NAME,
  iamRoleCrn: process.env.WATSON_IAM_ROLE_CRN,
  iamServiceIdCrn: process.env.WATSON_IAM_SERVICE_ID_CRN,
  url: process.env.WATSON_URL,
};

module.exports = watsonConfig;
