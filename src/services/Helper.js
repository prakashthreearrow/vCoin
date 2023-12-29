const path = require('path');
const moment = require('moment');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const { ssm } = require('../config/aws');
const Response = require('../services/Response');
const { RANDOM_DIGIT, RANDOM_ALPHANUMERICS, IMAGE_SIZE, FILE_MINETYPE, CRYPTO, SUBSCRIPTION_TYPE_BY, ACTIVE, VIBECOIN_LIMIT, REFERRALS_MODEL, PROMOTION_MODEL, VIBECOIN_TRANSFER_TYPE } = require('../services/Constants');
const { LoyaltyCard, StorePlan, Plan, Promotion, sequelize, FeaturesAccessByPlan, PlanFeature, VibecoinLimit, VibecoinPurchase, Referrals, VibecoinTransaction, Reward } = require('../models');

module.exports = {
    AppName: 'VibeCoin',
    emailTemplate: 'emails',
    subscriptionTemplate: 'subscriptions',
    vibecoinTransferTemplate: 'vibecoinTransfer',

   /**
    * @description This function use for convert alphabet to uppercase
    * @param str
    * @returns {*}
    */
    toUpperCase: (str) => {
        if (str.length > 0) {
            const newStr = str.toLowerCase()
                .replace(/_([a-z])/, (m) => m.toUpperCase())
                .replace(/_/, '');
            return str.charAt(0)
                .toUpperCase() + newStr.slice(1);
        }
        return '';
    },

   /**
    * @description This function use to set date format.
    * @param date
    * @returns {*}
    */
    dateFormatWithTime: (date) => {
        if (date) {
            return moment(date).format('YYYY-MM-DD hh:mm A');
        }
        return '';
    },

   /**
    * @description This function use to set expiry time.
    * @param date
    * @returns {*}
    */
    expiryTime: (expiryTime) => {
        if (expiryTime) {
            return Math.floor(moment().valueOf() / 1000) +
                60 * 60 * 24 * expiryTime;
        }
        return '';
    },

   /**
    * @description This function use for create random alphanumeric characters
    * @param length
    * @returns {*}
    */
    makeRandomAlphanumericCharacters: (length) => {
        let result = '';
        const characters = RANDOM_ALPHANUMERICS;
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

   /**
    * @description This function use for create validation unique key
    * @param apiTag
    * @param error
    * @return {*}
    */
    validationMessageKey: (apiTag, error) => {
        let key = module.exports.toUpperCase(error.details[0].context.key);
        let type = error.details[0].type.split('.');
        type = module.exports.toUpperCase(type[1]);
        key = apiTag + key + type;
        return key;
    },

   /**
    * @description This function use for Making Random Digit
    * @param length
    * @return {*}
    */
    makeRandomDigit: (length) => {
        let result = '';
        const characters = RANDOM_DIGIT;
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

   /**
    * @description This function use to check referrals
    * @param referral_id
    * @param amount
    * @return {*}
    */
    referralsChecking: async (referral_id, amount) => {
        try {
            // customer referrals amount
            let referralsData = await Referrals.findOne({
                attributes: ['id', 'from_id', 'to_id', 'promotion_id', 'is_paid'],
                where: {
                    to_id: referral_id,
                    type: REFERRALS_MODEL.TYPE.REFERRALS
                }
            });

            let promotionData = null;
            if (referralsData.is_paid === REFERRALS_MODEL.FALSE) {
                promotionData = await Promotion.findOne({
                    attributes: ['id', 'type', 'loyalty_card_id', 'customer_amount', 'customer_referral_amount'],
                    where: {
                        id: referralsData.promotion_id,
                        type: parseInt(PROMOTION_MODEL.TYPE.PAID_REFERRALS)
                    }
                });

                if (promotionData !== null) {
                    const rewardsObj = {
                        user_id: parseInt(referralsData.to_id),
                        promotion_id: parseInt(referralsData.promotion_id),
                        referrals_id: parseInt(referralsData.id),
                        is_paid: REFERRALS_MODEL.TRUE
                    };

                    if (promotionData.customer_amount < amount) {
                        var referral_amount = Math.floor(amount / promotionData.customer_amount);
                        rewardsObj.amount = referral_amount;
                    } else {
                        rewardsObj.amount = 0;
                    }

                    let rewardInfo = await Reward.create(rewardsObj);

                    if (rewardInfo !== null) {
                        let loyaltyCardData = await LoyaltyCard.findOne({
                            attributes: ['id', 'store_id'],
                            where: {
                                id: promotionData.loyalty_card_id
                            }
                        });

                        if (loyaltyCardData !== null) {
                            if (promotionData.customer_amount > amount) {
                                const vibecoinTransactionObj = {
                                    reward_id: rewardInfo.id,
                                    amount: referral_amount,
                                };
                                let query = {
                                    from_id: referral_id,
                                    to_id: parseInt(loyaltyCardData.store_id),
                                    from_type: VIBECOIN_TRANSFER_TYPE.USER,
                                    to_type: VIBECOIN_TRANSFER_TYPE.STORE,
                                };
                                VibecoinTransaction.update(vibecoinTransactionObj, { where: query });
                            }
                        }
                    }
                }
            }

            // referral chain
            let from_id = [];
            let referrals_ids = [];
            from_id.push(referralsData.from_id);
            do {
                let referralsInfo = await Referrals.findOne({
                    attributes: ['id', 'from_id', 'to_id', 'promotion_id', 'is_paid'],
                    where: {
                        to_id: from_id,
                        type: REFERRALS_MODEL.TYPE.REFERRALS
                    }
                });

                if (referralsInfo === null) {
                    break;
                }
                if (referralsInfo.is_paid === REFERRALS_MODEL.FALSE) {
                    let promotionInfo = await Promotion.findOne({
                        attributes: ['id', 'type', 'customer_amount', 'customer_referral_amount'],
                        where: {
                            id: referralsInfo.promotion_id,
                            type: parseInt(PROMOTION_MODEL.TYPE.PAID_REFERRALS)
                        }
                    });

                    if (promotionInfo !== null) {
                        from_id.pop();
                        const rewardsObj = {
                            user_id: referralsInfo.to_id,
                            promotion_id: referralsInfo.promotion_id,
                            referrals_id: referralsInfo.id
                        };
                        let rewardInfo = await Reward.create(rewardsObj);
                        if (rewardInfo !== null) {
                            from_id.push(referralsInfo.from_id);
                            referrals_ids.push(referralsInfo.id);
                        }
                    } else {
                        break;
                    }
                } else {
                    from_id.pop();
                    from_id.push(referralsInfo.from_id);
                }
            } while (true);

            let referrals_amount_equally_divided = 0;

            if (referralsData !== null) {
                if (promotionData !== null) {
                    referrals_amount_equally_divided = Math.round(promotionData.customer_referral_amount / referrals_ids.length);
                }
            }

            const rewardInfoObj = {
                amount: referrals_amount_equally_divided,
            };

            let query = {
                referrals_id: { [Op.in]: referrals_ids },
                is_paid: REFERRALS_MODEL.FALSE,
            }
            let updateRewards = await Reward.update(rewardInfoObj, { where: query });

            if (updateRewards) {
                return true
            }
        } catch (error) {
        }
    },

   /**
    * @description This function use to check subscription plan restrictions for business store wise
    * @param store_id
    * @param loyaltyCard_id
    * @param plan_features
    * @return {*}
    */
    checkSubscriptionPlan: async (subscription_type_by_id, subscription_type_by, plan_features) => {
        try {
            if (subscription_type_by === SUBSCRIPTION_TYPE_BY.LOYALTYCARD) {

                let loyaltyCardInfo = await LoyaltyCard.findOne({
                    attributes: ['id', 'store_id'],
                    where: {
                        id: subscription_type_by_id,
                        status: ACTIVE
                    }
                });

                if (loyaltyCardInfo !== null) {
                    let storePlanInfo = await StorePlan.findOne({
                        attributes: ['id', 'plan_id'],
                        where: {
                            store_id: loyaltyCardInfo.store_id
                        },
                        include: [{
                            model: Plan, attributes: ['id', 'type', 'title'],
                        }],
                    });
                   
                    if (storePlanInfo !== null) {
                        let planFeaturesMenu = await PlanFeature.findOne({
                            attributes: ['id', 'name'],
                            where: {
                                name: plan_features,
                                status: ACTIVE
                            },
                        });
        
                        let featuresAccessByPlanInfo = await FeaturesAccessByPlan.findOne({
                            attributes: ['id', 'plan_feature_id', 'access_type', 'limited_value'],
                            where: {
                                plan_id: storePlanInfo.Plan.id,
                                plan_feature_id: planFeaturesMenu.id
                            },
                        });
                    
                        if (featuresAccessByPlanInfo !== null) {
                            let planFeaturesInfo = await PlanFeature.findOne({
                                attributes: ['id', 'name'],
                                where: {
                                    id: featuresAccessByPlanInfo.plan_feature_id
                                },
                            });

                            if (planFeaturesInfo !== null) {
                                let promotion = {
                                    storePlanInfo: storePlanInfo,
                                    planFeaturesInfo: featuresAccessByPlanInfo
                                }
                                return promotion
                            }
                        }
                    }
                }

            } else if (subscription_type_by === SUBSCRIPTION_TYPE_BY.STORE) {

                let storePlanInfo = await StorePlan.findOne({
                    attributes: ['id', 'plan_id'],
                    where: {
                        store_id: subscription_type_by_id
                    },
                    include: [{
                        model: Plan, attributes: ['id', 'type', 'title'],
                    }],
                });

                if (storePlanInfo !== null) {
                    let planFeaturesMenu = await PlanFeature.findOne({
                        attributes: ['id', 'name'],
                        where: {
                            name: plan_features,
                            status: ACTIVE
                        },
                    });

                    let featuresAccessByPlanInfo = await FeaturesAccessByPlan.findOne({
                        attributes: ['id', 'plan_feature_id', 'access_type', 'limited_value'],
                        where: {
                            plan_id: storePlanInfo.Plan.id,
                            plan_feature_id: planFeaturesMenu.id
                        },
                    });

                    if (featuresAccessByPlanInfo !== null) {
                        let planFeaturesInfo = await PlanFeature.findOne({
                            attributes: ['id', 'name'],
                            where: {
                                id: featuresAccessByPlanInfo.plan_feature_id,
                                status: ACTIVE
                            },
                        });

                        if (planFeaturesInfo !== null) {
                            let loyaltyCard = {
                                storePlanInfo: storePlanInfo,
                                planFeaturesInfo: featuresAccessByPlanInfo
                            }
                            return loyaltyCard
                        }
                    }
                }
            } else {
                return null
            }
        } catch (error) {
        }
    },

   /**
    * @description This function use to check vibecoin transaction limit of either business or user
    * @param type
    * @param referance_id
    * @return {*}
    */
    checkVibecoinTransactionLimit: async (reference_id, referance_type) => {
        try {
            let current_time = moment();

            // one hour back from current date and time.
            let oneHoursBefore = new Date();
            oneHoursBefore.setHours(oneHoursBefore.getHours() - 1);
            const oneHoursBefore_time_timestamptz = moment(oneHoursBefore).tz('Asia/Calcutta').format();

            // one day back from current date and time.
            var oneDayBefore = new Date();
            oneDayBefore.setDate(oneDayBefore.getDate() - 1);
            const oneDayBefore_time_timestamptz = moment(oneDayBefore).tz('Asia/Calcutta').format();

            let vibecoinLimitInfo = await VibecoinLimit.findOne({
                attributes: ['id', 'amount', 'duration'],
                where: {
                    type: referance_type,
                    status: ACTIVE
                }
            });

            let query = {
                buyer_id: reference_id,
                type: referance_type,
            };

            let vibecoinPurchaseData = null;
            if (vibecoinLimitInfo.duration === VIBECOIN_LIMIT.DURATION.MINUTE) {

                query = {
                    ...query,
                    createdAt: {
                        [Op.gte]: sequelize.literal("NOW() - (INTERVAL '1 MINUTE')"),
                    },
                };

            } else if (vibecoinLimitInfo.duration === VIBECOIN_LIMIT.DURATION.HOUR) {

                query = {
                    ...query,
                    createdAt: {
                        [Op.between]: [oneHoursBefore_time_timestamptz, current_time]
                    }
                };

            } else if (vibecoinLimitInfo.duration === VIBECOIN_LIMIT.DURATION.DAY) {
                query = {
                    ...query,
                    createdAt: {
                        [Op.gte]: oneDayBefore_time_timestamptz,
                        [Op.lte]: current_time
                    },
                };
            }

            vibecoinPurchaseData = await VibecoinPurchase.findAll({
                attributes: ['id', 'amount'],
                where: query,
                distinct: true
            });

            let vibecoinPurchaseTotalLimitAmount = 0;

            vibecoinPurchaseData.map((vibecoinPurchase) => {
                vibecoinPurchaseTotalLimitAmount = vibecoinPurchaseTotalLimitAmount + vibecoinPurchase.amount
            })

            if (vibecoinLimitInfo.amount >= vibecoinPurchaseTotalLimitAmount) {
                return vibecoinLimitInfo.amount
            } else {
                return 0
            }

        } catch (error) {
        }
    },

   /**
    * @description This function used for Image Validation
    * @param image
    * @return {*}
    */
    async imageValidation(req, res, image) {
        try {
            const extension = image.mimetype ? image.mimetype : image.type;
            const imageExtArr = [FILE_MINETYPE.JPG, FILE_MINETYPE.JPEG, FILE_MINETYPE.PNG];
            if (image && (!imageExtArr.includes(extension))) {
                return Response.errorResponseWithoutData(res, res.__('imageInvalid'), StatusCodes.BAD_REQUEST);
            }
            return true;
        }
        catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description This function used for Image Size Validation
    * @param image
    * @return {*}
    */
    async imageSizeValidation(req, res, image) {
        try {
            if (image >= IMAGE_SIZE) {
                return Response.errorResponseWithoutData(res, res.__('LargeImage'), StatusCodes.BAD_REQUEST);
            }
            return true;
        }
        catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description This function is use to set amount format.
    * @param amount
    * @return {*}
    */
    amountFormat: (amount) => {
        // var formatter = new Intl.NumberFormat('en-US', {
        //     style: 'currency',
        //     currency: 'USD',
        // });
        //return formatter.format(amount);
        return amount;
    },

   /**
    * @description This function use for generate timestamp in miliseconds.
    * @param date
    * @return {*}
    */
    dateTimeTimestamp: (date) => {
        return new Date(date).getTime() / 1000;
    },

   /**
    * @description This function use for convert from DOB to your current age.
    * @param date
    * @return {*}
    */
    dobToAge: (date) => {
        var dob = date;
        var year = Number(dob.substr(0, 4));
        var month = Number(dob.substr(5, 2)) - 1;
        var day = Number(dob.substr(8, 2));
        var today = new Date();
        var age_y = today.getFullYear() - year;
        var age_m = today.getMonth() - month;
        var age_d = today.getDate() - day;
        /* if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) {
          age--;
        } */
        if (age_y !== 0 || age_y > 0) {
            if (age_y === 1) {
                return age_y + ' ' + 'year';
            } else {
                return age_y + ' ' + 'years';
            }
        } else if (age_m !== 0 || age_m > 0) {
            if (age_m === 1) {
                return age_m + ' ' + 'month';
            } else {
                return age_m + ' ' + 'months';
            }
        } else {
            if (age_d === 1) {
                return age_d + ' ' + 'day';
            } else {
                return age_d + ' ' + 'days';
            }
        }
    },

   /**
    * @description This function use for format the number of amount as per the range of amount.
    * @param cases
    * @return {*}
    */
    unitConversion: (cases) => {
        if (isNaN(cases)) return cases;
        if (cases < 999) {
            return cases;
        }
        if (cases < 1000000) {
            return Math.round(cases / 1000) + "K";
        }
        if (cases < 10000000) {
            return (cases / 1000000).toFixed(2) + "M";
        }
        if (cases < 1000000000) {
            return Math.round((cases / 1000000)) + "M";
        }
        if (cases < 1000000000000) {
            return Math.round((cases / 1000000000)) + "B";
        }
        return "1T+";
    },

   /**
    * @description This function use to generate unique file name.
    * @param file
    * @return {*}
    */
    generateUniqueFileName: (file) => {
        // file = file.replace(/[ _!@#$%^&*]/g, "")
        const originalName = file.split(".")[0];
        // Below line of code will generate 10 digit of random random which we take it as image name 
        const time = Math.floor(new Date().valueOf() * Math.random());
        // Below line of code will set the image name(time) with extention(extension which we had pass in the body) 
        const fileName = `${originalName}_${time}${path.extname(file)}`;
        return fileName;
    },

   /**
    * @description This function use to remove all special characters..
    * @param fileName
    * @return {*}
    */
    removeSpecialCharacter: (fileName) => {
        // Below line of code will remove special character.
        let fileRename = fileName.replace(/[ _!@#$%^&*]/g, "")
        return fileRename;
    },

   /**
    * @description This function use to generate file log name.
    * @returns {*}
    */
    generateLogFileName: () => {
        return `${moment().format('DD.MM.YYYY')}.log`
    },

   /**
    * @description This function use to generate webhook file log name.
    * @returns {*}
    */
    generateWebhookLogFileName: () => {
        return `${moment().format('DD.MM.YYYY')}_webhook.log`
    },

   /**
    * @description This function use to replace dynamic value of email template table.
    * @param replacements
    * @param template
    * @returns {*}
    */
    emailBody: (replacements, template) => {
        const result = template.replace(/%([^%]+)%/g, (match, key) => {
            return replacements[key] !== undefined
                ? replacements[key]
                : "";
        });
        return result;
    },

   /**
    * @description This function use to paginate the data.
    * @param startIndex
    * @param endIndex
    * @param arrayData
    * @returns {*}
    */
    pagination: (startIndex, endIndex, arrayData) => {
        const result = arrayData.slice(startIndex, endIndex)
        return result;
    },

   /**
    * @description This function use to encrypt the data.
    * @param privateKey
    * @returns {*}
    */
    encryptData: (privateKey = null) => {
        if (privateKey === null) {
            return false;
        }
        let algorithm = CRYPTO.CRYPTO_OPTIONS.ALGORITHM; // or any other algorithm supported by OpenSSL
        let random_key = CRYPTO.CRYPTO_OPTIONS.RANDOM_KEY;
        let cipher = crypto.createCipher(algorithm, random_key);
        let encrypted = cipher.update(privateKey, CRYPTO.CRYPTO_OPTIONS.ENCODE, CRYPTO.CRYPTO_OPTIONS.DIGEST) + cipher.final(CRYPTO.CRYPTO_OPTIONS.DIGEST);

        if (typeof encrypted !== 'undefined') {
            return encrypted;
        }
        return false;
    },

   /**
    * @description This function use to decrypt the data.
    * @param privateKey
    * @returns {*}
    */
    decryptData: (privateKey = null) => {
        if (privateKey === null) {
            return false;
        }
        let algorithm = CRYPTO.CRYPTO_OPTIONS.ALGORITHM; // or any other algorithm supported by OpenSSL
        let key = CRYPTO.CRYPTO_OPTIONS.RANDOM_KEY;
        var decipher = crypto.createDecipher(algorithm, key);
        var decrypted = decipher.update(privateKey, CRYPTO.CRYPTO_OPTIONS.DIGEST, CRYPTO.CRYPTO_OPTIONS.ENCODE) + decipher.final(CRYPTO.CRYPTO_OPTIONS.ENCODE);

        if (typeof decrypted !== 'undefined') {
            return decrypted;
        }
        return false;
    },

   /**
    * @description This function use to get admin private key and address.
    * @param keyParam
    * @returns {*}
    */
    getKey: async (keyParam) => {
        if (keyParam) {
            const getParam = param => {
                return new Promise((res, rej) => {
                    ssm.getParameter({
                        Name: param,
                        WithDecryption: true
                    }, (err, data) => {
                        if (err) {
                            return rej(err)
                        }

                        return res(data)
                    })
                })
            }
            let keyValue = await getParam(keyParam);
            if (keyValue !== '') {

                return keyValue.Parameter.Value;
            }
        }
        return false;
    },
}
