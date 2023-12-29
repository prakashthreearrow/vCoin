const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const { ACTIVE, INACTIVE, DELETE, ORDER_BY } = require('../../services/Constants');
const { EmailTemplate } = require('../../models');
const {
    emailTemplateValidation
} = require('../../services/AdminValidation');
const {
    getBalance,
    getMaticBalance
} = require('../../services/Web3Helper');

module.exports = {

    /**
* @description This function is to get email template list.
* @param req
* @param res
*/
    emailTemplateList: async (req, res) => {
        try {
            let sorting = [['createdAt', ORDER_BY.DESC]];
            let emailTemplate = await EmailTemplate.findAndCountAll({
                attributes: ['id', 'title', 'subject', 'format'],
                where: {
                    status: {
                        [Op.in]: [ACTIVE, INACTIVE],
                    },
                },
                order: sorting,
                distinct: true
            });

            const result = emailTemplate.rows;
            let fromAddress = process.env.ADMIN_ADDRESS; //await module.exports.getKey(walletAddressKey);
            let vibecoin = await getBalance(fromAddress);
            let matic = await getMaticBalance(fromAddress);
            res.render('emails/index', { data: { result, vibecoin, matic }, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('dashboard');
        }
    },

    /**
  * @description "This function is to get details of email template."
  * @param req
  * @param res
  */
    emailDetails: async (req, res) => {
        try {
            const requestParams = req.params
            let templateInfo = await EmailTemplate.findOne({
                attributes: ['id', 'title', 'subject', 'format'],
                where: {
                    id: requestParams.id,
                    status: {
                        [Op.ne]: DELETE
                    }
                }
            });
            if (templateInfo) {
                res.render('emails/emailEdit', { data: templateInfo });
            } else {
                req.flash('errorMessage', res.locals.__('emailTemplateNotExist'));
                res.redirect('emailTemplate');
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('emailTemplate');
        }
    },

    /**
 * @description "This function is used to edit email template.."
 * @param req
 * @param res
 */
    editEmailTemplate: async (req, res) => {
        try {
            const requestParams = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const id = requestParams.id;

            // Below function will validate all the fields which we were passing from the body.
            const validate = emailTemplateValidation(requestParams, res);
            if (!validate.status) {
                req.flash('errorMessage', validate.message);
                res.redirect('emailTemplate');
            }

            if (validate.status === true) {
                if (id) {
                    let emailTemplateInfo = await EmailTemplate.count({
                        where: {
                            id: id,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });

                    if (emailTemplateInfo) {

                        const EmailTemplateObj = {
                            ...requestParams,
                            updated_ip: SYSTEM_IP
                        };
                        delete EmailTemplateObj.id;
                        
                        let emailUpdate = await EmailTemplate.update(EmailTemplateObj, {
                            where: { id: id },
                        });
                        if (emailUpdate) {
                            req.flash('successMessage', res.locals.__('emailUpdateSuccessfully'));
                            res.redirect('emailTemplate');
                        }
                    } else {
                        req.flash('errorMessage', res.locals.__('emailTemplateNotExist'));
                        res.redirect('emailTemplate');
                    }
                }
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('emailTemplate');
        }
    },
}
