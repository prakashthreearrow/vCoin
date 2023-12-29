const { StatusCodes } = require('http-status-codes');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const Helper = require('../../services/Helper');
const PushNotification = require('../../services/PushNotifications');
const Response = require('../../services/Response');
const Stripe = require('../../config/stripe');
const { EMAIL_TEMPLATE_TYPE, PLAN_MODEL, SUBSCRIPTION_USER_AS_PLURAL, STRIPE_MODEL } = require('../../services/Constants');
const stripeInstance = new Stripe();
const {
    createCardValidation,
    removeCardValidation,
    getAllCardValidation,
    defaultCardValidation
} = require('../../services/UserValidation');
const { StorePlan, StorePlanSubscription } = require('../../models');

module.exports = {

    /**
     * @description This function is to get card list.
     * @param req
     * @param res
     */
    cardsList: async (req, res) => {
        try {
            const requestParams = req.params;
            const validate = getAllCardValidation(requestParams, res);
            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const cards = await stripeInstance.getAllCards(requestParams.customer_id);
            return Response.successResponseData(res, cards, StatusCodes.OK, res.__('success'));
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

    /**
     * @description This function is to create new card.
     * @param req
     * @param res
     */
    createCard: async (req, res) => {
        try {
            const requestParams = req.body;
            const validate = createCardValidation(requestParams, res);

            const card_data = {
                ...requestParams
            }

            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const createdCard = await stripeInstance.createCard(requestParams.customer_id, card_data);
            if (createdCard) return Response.successResponseData(res, createdCard, StatusCodes.OK, res.__('cardAddedSuccessfully'));
            return Response.errorResponseWithoutData(res, res.__('internalError'), StatusCodes.OK);
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

    /**
     * @description This function is to remove card.
     * @param req
     * @param res
     */
    removeCard: async (req, res) => {
        try {
            const requestParams = req.body;
            const validate = removeCardValidation(requestParams, res);
            if (!validate.status) return Response.errorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const isDeleted = await stripeInstance.deleteCard(requestParams.customer_id, requestParams.card_id);
            if (isDeleted) return Response.successResponseWithoutData(res, res.__('cardDeleted'), StatusCodes.OK);
            return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);

        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

    /**
     * @description This function is to make default card.
     * @param req
     * @param res
     */
    makeDefaultCard: async (req, res) => {
        try {
            const requestParams = req.body;
            const validate = defaultCardValidation(requestParams, res);
            if (!validate.status) return Response.errorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const customer = await stripeInstance.makeDefaultCard(requestParams.customer_id, requestParams.card_id);

            if (customer) return Response.successResponseWithoutData(res, res.__('defaultCardSuccessfully'), StatusCodes.OK);
            return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);

        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description This function is to save store plan sucscribtion.
    * @param req
    * @param res
    */
    saveStorePlanSubscribtion: async (payload) => {
        try {
            const { authUserId } = req;
            const period_end_date = moment.unix(payload.data.object.period_end).format();
            const period_start_date = moment.unix(payload.data.object.period_start).format();
            await StorePlan.update({ subscription_end_date: period_end_date }, {
                where: {
                    subscribtion_id: payload.data.object.subscription
                }
            });

            const storePlanDetails = await StorePlan.findOne({
                where: {
                    subscribtion_id: payload.data.object.subscription
                }
            });

            const store_plan_data = {
                store_plan_id: storePlanDetails.id,
                event_id: payload.id,
                invoice_id: payload.data.object.id,
                period_end: period_end_date
            }

            let adminInfo = await User.findOne({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'email'],
                where: {
                    type: 1,
                    status: ACTIVE
                }
            });

            let userInfo = await User.findOne({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'email'],
                where: {
                    id: authUserId,
                    status: ACTIVE
                }
            });

            let planInfo = await Plan.findOne({
                attributes: ['id', 'plan_price_id', 'title', 'price', 'subscription_type'],
                where: {
                    id: storePlanDetails.id
                }
            });

            let storeBusinessInfo = await Store.findOne({
                where: {
                    id: storePlanDetails.store_id
                },
                include: [{
                    model: Business,
                    attributes: ['id', 'name'],
                }],
            });

            await StorePlanSubscription.create(store_plan_data);

            let emailTemplateModel = await EmailTemplate.findOne({
                attributes: ['id', 'title', 'subject', 'format'],
                where: {
                    type: EMAIL_TEMPLATE_TYPE.SUBSCRIPTION_RENEW,
                    status: {
                        [Op.ne]: DELETE
                    },
                },
            });

            let userDynamicValues = {
                user_name: userInfo.full_name,
                You: SUBSCRIPTION_USER_AS_PLURAL,
                store_name: storeBusinessInfo.name,
                business_name: storeBusinessInfo.Business.name,
                plan_title: planInfo.title,
                price: planInfo.price,
                subscription_type: PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type],
                subscription_start_date: await Helper.dateFormatWithTime(moment().toDate(period_start_date)),
                subscription_end_date: await Helper.dateFormatWithTime(period_end_date)
            }

            let userEmailBody = Helper.emailBody(userDynamicValues, emailTemplateModel.format);

            const locals = {
                appName: Helper.AppName,
                title: emailTemplateModel.title,
                format: userEmailBody
            };

            Mailer.sendMail(adminInfo.email, emailTemplateModel.subject, Helper.subscriptionTemplate, locals);

            let adminDynamicValues = {
                admin_name: adminInfo.full_name,
                You: userInfo.full_name,
                store_name: storeBusinessInfo.name,
                business_name: storeBusinessInfo.Business.name,
                plan_title: planInfo.title,
                price: planInfo.price,
                subscription_type: PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type],
                subscription_start_date: await Helper.dateFormatWithTime(moment().toDate(period_start_date)),
                subscription_end_date: await Helper.dateFormatWithTime(period_end_date)
            }

            let adminEmailBody = Helper.emailBody(adminDynamicValues, emailTemplateModel.format);

            const adminLocals = {
                appName: Helper.AppName,
                title: emailTemplateModel.title,
                format: adminEmailBody
            };

            Mailer.sendMail(userInfo.email, emailTemplateModel.subject, Helper.subscriptionTemplate, adminLocals);

            let notification = {
                title: emailTemplateModel.title,
                You: userInfo.full_name,
                price: planInfo.price,
                subscription_type: PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type],
                business_name: storeBusinessInfo.Business.name,
                store_name: storeBusinessInfo.name,
            }
            PushNotification.pushNotification(notification, userInfo.fcm_token);

            return Response.successResponseWithoutData(res, res.__('success'), StatusCodes.OK);

        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description This function is to generate file as per the types.
    * @param req
    * @param res
    */
    webhook: async (req, res) => {
        const event = req.body;
        try {
            var paymentMethod = '';
            var stream = fs.createWriteStream(path.join(`${process.cwd()}/logs`, Helper.generateWebhookLogFileName()), { flags: 'w' })
            stream.write(STRIPE_MODEL.WEBHOOK + JSON.stringify(event) + "\n");
            morgan('common', {
                stream: stream
            })
            stream.end();

            // Handle the event
            switch (event.type) {
                case STRIPE_MODEL.WEBHOOK_TYPE.INVOICE_PAYMENT_FAILED:
                    paymentMethod = event;
                    break;
                case STRIPE_MODEL.WEBHOOK_TYPE.INVOICE_PAYMENT_SUCCEEDED:
                    await module.exports.saveStorePlanSubscribtion(event)
                    break;
                // ... handle other event types
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            // Return a response to acknowledge receipt of the event
            res.json({ received: true, type: event.type, success: true });
        } catch (err) {
            console.log("/webhooks route error: ", err)
            res.json({ received: true, type: event.type, success: false });
        }
    }
}