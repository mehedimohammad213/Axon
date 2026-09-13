const { deleted } = require('./response');

function sendServiceResult(res, result, statusCode = 200) {
  return res.status(statusCode).json(result);
}

function sendDeleted(res, resourceName) {
  return deleted(res, resourceName);
}

module.exports = { sendServiceResult, sendDeleted };
