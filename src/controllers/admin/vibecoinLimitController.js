const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const { ACTIVE, DELETE, VIBECOIN_LIMIT } = require('../../services/Constants');
const { VibecoinLimit } = require('../../models');
const {
    vibecoinLimitValidation
} = require('../../services/AdminValidation');

const Helper = require('../../services/Helper');

module.exports = {

    /**
* @description This function is to get vibecoin limit list.
* @param req
* @param res
*/
    vibecoinLimitList: async (req, res) => {
        try {
            let vibecoinLimitData = await VibecoinLimit.findAll({
                attributes: ['id', 'amount', 'duration', 'type'],
                where: {
                    status: ACTIVE,
                },
                distinct: true
            });
            var vibecoinLimitInfo = [];
            for (let i = 0; i < vibecoinLimitData.length; i++) {
                vibecoinLimitInfo = [...vibecoinLimitInfo, {
                    id: vibecoinLimitData[i].id, amount: vibecoinLimitData[i].amount, duration: vibecoinLimitData[i].duration,
                    type: vibecoinLimitData[i].type
                }];
            }
            res.render('vibecoinLimit/index', { data: { vibecoinLimitInfo }, Helper: Helper, DURATION_OPTION: VIBECOIN_LIMIT.DURATION_OPTION, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('dashboard');
        }
    },

    /**
  * @description "This function is to get details of vibecoin limit."
  * @param req
  * @param res
  */
    vibecoinDetails: async (req, res) => {
        try {
            const requestParams = req.params
            let vibecoinLimitInfo = await VibecoinLimit.findOne({
                attributes: ['id', 'amount', 'duration'],
                where: {
                    id: requestParams.id,
                    status: {
                        [Op.ne]: DELETE
                    }
                }
            });

            if (vibecoinLimitInfo) {
                res.render('vibecoinLimit/index', { vibecoinData: vibecoinLimitInfo });
            } else {
                req.flash('errorMessage', res.locals.__('vibecoinLimitNotExist'));
                res.redirect('get_vibecoin_limit');
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('get_vibecoin_limit');
        }
    },

    /**
* @description "This function is used to edit vibecoin limit."
* @param req
* @param res
*/
    editVibecoinLimit: async (req, res) => {
        try {
            const requestParams = req.body;
            const id = requestParams.id;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // Below function will validate all the fields which we were passing from the body.
            const validate = vibecoinLimitValidation(requestParams, res);
            if (!validate.status) {
                req.flash('errorMessage', validate.message);
                res.redirect('get_vibecoin_limit');
            }

            if (validate.status === true) {
                if (id) {
                    let vibecoinLimit = await VibecoinLimit.count({
                        where: {
                            id: id,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });

                    if (vibecoinLimit) {

                        const VibecoinLimitObj = {
                            amount: requestParams.amount,
                            duration: requestParams.duration,
                            updated_ip: SYSTEM_IP
                        };
                        let query = {
                            status: ACTIVE,
                        };
                        let vibecoinLimitUpdate = await VibecoinLimit.update(VibecoinLimitObj, {
                            where: { id: id },
                        });

                        if (vibecoinLimitUpdate) {
                            let vibecoinLimitInfo = await VibecoinLimit.findAll({
                                attributes: ['id', 'amount', 'duration'],
                                where: query,
                                distinct: true
                            });
                            if (vibecoinLimitInfo) {
                                res.render('vibecoinLimit/index', { data: { vibecoinLimitInfo }, DURATION_OPTION: VIBECOIN_LIMIT.DURATION_OPTION, Helper: Helper });
                            } else {
                                return Response.successResponseWithoutData(
                                    res,
                                    res.locals.__('noDataFound')
                                );
                            }
                        }
                    } else {
                        req.flash('errorMessage', res.locals.__('vibecoinLimitNotExist'));
                        res.redirect('get_vibecoin_limit');
                    }
                }
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('get_vibecoin_limit');
        }
    },
}
