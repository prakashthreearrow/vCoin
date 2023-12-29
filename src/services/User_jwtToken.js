const jwt = require('jsonwebtoken')
const Response = require('../services/Response');

// Generates an uploads token
module.exports.issueUser = function (payload) {
  return jwt.sign({
    id: payload.id,
    type: payload.type,
    exp: payload.exp,
  }, process.env.JWT_USER_SECRETKEY, { algorithm: process.env.JWT_ALGORITHM });
}

// Verifies uploads token
module.exports.verify = function (token, callback) {
  try {
    return jwt.verify(token, process.env.JWT_USER_SECRETKEY, {}, callback);
  } catch (err) {
    return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Decode token on a request and get without bearer
module.exports.decode = async (token) => {
  const parts = token.split(' ');
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
    return false;
  }
  return false;
}
