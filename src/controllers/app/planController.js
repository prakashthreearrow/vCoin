const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const moment = require('moment');
const { Plan, PlanFeature, FeaturesAccessByPlan, StorePlan, Store, User, Business, EmailTemplate } = require('../../models');
const Response = require('../../services/Response');
const Stripe = require('../../config/stripe');
const Helper = require('../../services/Helper');
const PushNotification = require('../../services/PushNotifications');
const Mailer = require('../../services/Mailer');
const { ACTIVE, PLAN_MODEL, EMAIL_TEMPLATE_TYPE, DELETE, SUBSCRIPTION_USER_AS_PLURAL, USER_MODEL } = require('../../services/Constants');
const stripeInstance = new Stripe();

module.exports = {

    /**
     * @description This function is to get plan list.
     * @param req
     * @param res
     */
    plansList: async (req, res) => {
        try {
            const plans = await Plan.findAll({
                attributes: ['id', 'title', 'type', 'typeName', 'photo', 'price', 'plan_price_id', 'description', 'subscription_type', 'subscription_type_name'],
                include: [{ model: FeaturesAccessByPlan, attributes: ['plan_feature_id', 'access_type', 'access_type_name', 'limited_value'], include: [{ model: PlanFeature, attributes: ['name'] }] }],
                distinct: true
            });
            return Response.successResponseData(res, plans, StatusCodes.OK, res.__('success'));
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

    /**
     * @description This function is to add plan.
     * @param req
     * @param res
     */
    storePlan: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;

            let adminInfo = await User.findOne({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'email', 'fcm_token'],
                where: {
                    type: USER_MODEL.TYPE.ADMIN_TYPE,
                    status: ACTIVE
                }
            });

            let userInfo = await User.findOne({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'email', 'fcm_token'],
                where: {
                    id: authUserId,
                    status: ACTIVE
                }
            });

            let planInfo = await Plan.findOne({
                attributes: ['id', 'type', 'plan_price_id', 'title', 'price', 'subscription_type'],
                where: {
                    id: requestParams.plan_id
                }
            });

            let storeBusinessInfo = await Store.findOne({
                where: {
                    id: requestParams.store_id
                },
                include: [{
                    model: Business,
                    attributes: ['id', 'name'],
                }],
            });

            let subscription_end_date = null;
            let subscription = null;
            StorePlanObj = {};
            if (planInfo.type !== parseInt(Object.keys(PLAN_MODEL.PLAN_TYPE)[0])) {
                subscription = await stripeInstance.createSubscribtion(requestParams.customer_id, planInfo.plan_price_id);
                subscription_end_date = moment.unix(subscription.current_period_end).format();
                StorePlanObj.subscribtion_id = subscription.id
            }

            let currentDate = moment().toDate();
            var futureDate = null;

            switch (planInfo.subscription_type) {
                case parseInt(Object.keys(PLAN_MODEL.SUBSCRIPTION_TYPE)[0]):
                    // add 1 month to current date 
                    futureDate = moment(currentDate).add(1, 'M');
                    break;
                case parseInt(Object.keys(PLAN_MODEL.SUBSCRIPTION_TYPE)[1]):
                    // add quater to current date 
                    futureDate = moment(currentDate).add(4, 'M');
                    break;
                case parseInt(Object.keys(PLAN_MODEL.SUBSCRIPTION_TYPE)[2]):
                    // add 1 year to current date
                    futureDate = moment(currentDate).add(1, 'year');
                    break;
                default:
                    // default will be added 1 month to current date
                    futureDate = moment(currentDate).add(1, 'M');
            }

            StorePlanObj = {
                ...StorePlanObj,
                store_id: requestParams.store_id,
                plan_id: requestParams.plan_id,
                subscription_end_date: subscription_end_date ? subscription_end_date : futureDate
            };
            await StorePlan.create(StorePlanObj);

            let emailTemplateModel = await EmailTemplate.findOne({
                attributes: ['id', 'title', 'subject', 'format'],
                where: {
                    type: EMAIL_TEMPLATE_TYPE.SUBSCRIPTION_BUY,
                    status: {
                        [Op.ne]: DELETE
                    },
                },
            });
            let subscription_start_date = (subscription === undefined || subscription === null) ? currentDate : await Helper.dateFormatWithTime(moment().toDate(subscription.start_date));
            let formatedSub_end_date = (subscription === undefined || subscription === null) ? futureDate : await Helper.dateFormatWithTime(subscription_end_date);

            let userDynamicValues = {
                user_name: userInfo.full_name,
                You: SUBSCRIPTION_USER_AS_PLURAL,
                store_name: storeBusinessInfo.name,
                business_name: storeBusinessInfo.Business.name,
                plan_title: planInfo.title,
                price: planInfo.price,
                subscription_type: PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type],
                subscription_start_date: subscription_start_date,
                subscription_end_date: formatedSub_end_date
            }

            let userEmailBody = Helper.emailBody(userDynamicValues, emailTemplateModel.format);

            const locals = {
                appName: Helper.AppName,
                title: emailTemplateModel.title,
                format: userEmailBody
            };

            Mailer.sendMail(adminInfo.email, emailTemplateModel.subject, Helper.subscriptionTemplate, locals);

            let notification = {
                title: emailTemplateModel.title,
                body: `${userInfo.full_name} have successfully subscribed for this ${storeBusinessInfo.name}! at ${planInfo.price} for ${PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type]} in ${storeBusinessInfo.Business.name}`
            }
            PushNotification.pushNotification(notification, userInfo.fcm_token);
            let adminDynamicValues = {
                admin_name: adminInfo.full_name,
                You: userInfo.full_name,
                store_name: storeBusinessInfo.name,
                business_name: storeBusinessInfo.Business.name,
                plan_title: planInfo.title,
                price: planInfo.price,
                subscription_type: PLAN_MODEL.SUBSCRIPTION_TYPE[planInfo.subscription_type],
                subscription_start_date: subscription_start_date,
                subscription_end_date: formatedSub_end_date
            }

            let adminEmailBody = Helper.emailBody(adminDynamicValues, emailTemplateModel.format);

            const adminLocals = {
                appName: Helper.AppName,
                title: emailTemplateModel.title,
                format: adminEmailBody
            };

            Mailer.sendMail(userInfo.email, 'Subscription Buy', Helper.subscriptionTemplate, adminLocals);

            return Response.successResponseWithoutData(res, res.__('StoreSubscriptionAddedSuccessfully'), StatusCodes.OK);

        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    }

}