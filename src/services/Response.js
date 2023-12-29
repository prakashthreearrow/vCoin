const { ENVIRONMENT_VARIABLE } = require('../services/Constants');

module.exports = {
   /**
    * @description This function use for format success response of rest api
    * @param data
    * @param code
    * @param message
    * @param res
    * @param extras
    * @returns {{data: *, meta: {message: *, code: *}}}
    */

    successResponseData(res, data, code = 1, message, extras) {
        const response = {
            data,
            status: true,
            message,
            pagination: {},
        };
        if (extras) {
            Object.keys(extras).forEach((key) => {
                if ({}.hasOwnProperty.call(extras, key)) {
                    response.pagination[key] = extras[key];
                }
            });
        }
        return res.send(response);
    },

    successLoginResponseData(res, data, code = 1, message, token) {
        const response = {
            data,
            message,
            status: true,
            token
        };
        return res.send(response);
    },

    successResponseWithoutData(res, message) {
        const response = {
            data: null,
            message,
            status: true
        };
        return res.send(response);
    },

    errorResponseData(res, message, data = null) {
       
        const response = {};
        if (process.env.NODE_ENV === ENVIRONMENT_VARIABLE.DEVELOPMENT) {
            response.data = data;
        }
        response.message = message;
        response.status = false;
        return res.send(response);
    },

    errorResponseWithoutData(res, message, code = 400) {
        const response = {
            status: false,
            message
        };
        return res.status(code)
            .send(response);
    },

    validationErrorResponseData(res, message, code = 400) {
        const response = {
            status: false,
            message
        };
        return res.status(code)
            .send(response);
    }
};
