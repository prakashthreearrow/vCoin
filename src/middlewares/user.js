const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const Response = require('../services/Response');
const jwToken = require('../services/User_jwtToken.js');
const { User } = require('../models');
const { INACTIVE, ACTIVE, DELETE } = require('../services/Constants');

module.exports = {

 /**
  * @description "This function will validate the token by passing it as a middleware in routes"
  * @param req
  * @param res
  */
  userTokenAuth: async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return Response.errorResponseWithoutData(
          res,
          res.locals.__('authorizationError'),
          StatusCodes.UNAUTHORIZED
        );
      } else {
        const tokenData = await jwToken.decode(token);
        if (tokenData) {
          jwToken.verify(tokenData, async (err, decoded) => {
            if (err) {
              Response.errorResponseWithoutData(res, res.locals.__('invalidToken'), StatusCodes.UNAUTHORIZED);
            }
            if (decoded.id) {
              req.authUserId = decoded.id;
              req.authUsertype = decoded.type;
              let result = await User.findOne({
                attributes: ['id', 'status'],
                where: {
                  id: req.authUserId,
                  type: req.authUsertype,
                  status: {
                    [Op.ne]: DELETE
                  },
                }
              });
              if (!result) {
                return Response.errorResponseWithoutData(
                  res,
                  res.locals.__('invalidToken'),
                  StatusCodes.UNAUTHORIZED
                );
              } else {
                if (result && result.status === INACTIVE) {
                  return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('accountIsInactive'),
                    StatusCodes.UNAUTHORIZED
                  );
                }
                if (result && result.status === ACTIVE) {
                  return next();
                } else {
                  return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('accountBlocked'),
                    StatusCodes.UNAUTHORIZED
                  );
                }
              }
            } else {
              Response.errorResponseWithoutData(res, res.locals.__('invalidToken'), StatusCodes.UNAUTHORIZED);
            }
          })
        } else {
          Response.errorResponseWithoutData(res, res.locals.__('invalidToken'), StatusCodes.UNAUTHORIZED);
        }
      }
    } catch (error) {
      return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
}
