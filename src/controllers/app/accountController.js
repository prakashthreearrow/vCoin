const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const { DELETE, USER_MODEL, VIBECOIN_TRANSFER_TYPE, SUCCESS, EMAIL_TEMPLATE_TYPE, SUBSCRIPTION_USER_AS_PLURAL, LIMIT, ORDER_BY, REFERRALS_MODEL, PROMOTION_MODEL, VIBECOIN_LIMIT, ACTIVE } = require('../../services/Constants');
const { User, Web3Account, VibecoinTransaction, VibecoinPurchase, Business, EmailTemplate, Store, Promotion, Referrals, Reward } = require('../../models');
const Web3Helper = require('../../services/Web3Helper');
const {
    transactionValidation,
    purchaseValidation,
    purchaseListValidation,
    transactionListValidation
} = require('../../services/UserValidation');
const Helper = require('../../services/Helper');
const Mailer = require('../../services/Mailer');
const PushNotification = require('../../services/PushNotifications');

module.exports = {
   /**
    * @description "This function is for get vibecoin Purchase list"
    * @param req
    * @param res
    */
    vibecoinPurchaseList: async (req, res) => {
        try {
            const requestParams = req.query;
            const validate = purchaseListValidation(requestParams, res);
            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;

            let query = {
                buyer_id: parseInt(requestParams.buyer_id),
                type: parseInt(requestParams.type)
            };

            let sorting = [['createdAt', ORDER_BY.DESC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }

            let data = await VibecoinPurchase.findAndCountAll({
                attributes: ['id', 'amount', 'transaction_id', 'createdAt'],
                where: query,
                order: sorting,
                offset: offset,
                limit: LIMIT,
                distinct: true
            });

            if (data.rows.length > 0) {
                const result = data.rows;
                const extra = {};
                extra.limit = LIMIT;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(res, result, StatusCodes.OK, res.__('success'), extra);
            } else {
                return Response.successResponseWithoutData(res, res.locals.__('noDataFound'));
            }
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description "This function is for get vibecoin transaction list"
    * @param req
    * @param res
    */
    vibecoinTransactionList: async (req, res) => {
        try {
            const requestParams = req.query;
            const validate = transactionListValidation(requestParams, res);
            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;

            let sorting = [['createdAt', ORDER_BY.DESC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }


            let data = await VibecoinTransaction.findAndCountAll({
                attributes: ['id', 'from_id', 'to_id', 'amount', 'to_type', 'createdAt'],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    from_id: parseInt(requestParams.id)
                                },
                                {
                                    to_id: parseInt(requestParams.id)
                                }
                            ]
                        }
                    ],
                    from_type: parseInt(requestParams.type)
                },
                order: sorting,
                offset: offset,
                limit: LIMIT,
                distinct: true
            });

            if (data.rows.length > 0) {
                const result = data.rows;
                var vibecoinTransactionInfo = [];
                for (let i = 0; i < result.length; i++) {
                    if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.USER) {
                        let query = {};
                        if (result[i].to_id === requestParams.id) {
                            query = {
                                ...query,
                                id: result[i].from_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        } else {
                            query = {
                                ...query,
                                id: result[i].to_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        }
                        let userInfo = await User.findOne({
                            attributes: ['id', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path'],
                            where: query
                        });

                        vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                            transaction_amount: result[i].from_id === requestParams.id ? `- ${await Helper.amountFormat(result[i].amount)}` : `+ ${await Helper.amountFormat(result[i].amount)}`, to_id: userInfo.full_name,
                            profile_photo: userInfo.profile_photo_path, createdAt: result[i].createdAt
                        }];

                    } else if (result[i].type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
                        let query = {};
                        if (result[i].to_id === requestParams.id) {
                            query = {
                                ...query,
                                id: result[i].from_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        } else {
                            query = {
                                ...query,
                                id: result[i].to_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        }
                        let businessInfo = await Business.findOne({
                            attributes: ['id', 'name', 'photo', 'photo_path'],
                            where: query
                        });
                        vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                            transaction_amount: result[i].from_id === requestParams.id ? `- ${await Helper.amountFormat(result[i].amount)}` : `+ ${await Helper.amountFormat(result[i].amount)}`, to_id: businessInfo.name,
                            profile_photo: businessInfo.photo_path, createdAt: result[i].createdAt
                        }];

                    } else {
                        let query = {};
                        if (result[i].to_id === requestParams.id) {
                            query = {
                                ...query,
                                id: result[i].from_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        } else {
                            query = {
                                ...query,
                                id: result[i].to_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        }
                        let storeInfo = await Store.findOne({
                            attributes: ['id', 'name', 'business_id'],
                            where: query
                        });
                        let businessData = await Business.findOne({
                            attributes: ['id', 'name', 'photo', 'photo_path'],
                            where: {
                                id: storeInfo.business_id
                            }
                        });
                        vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                            transaction_amount: result[i].from_id === requestParams.id ? `- ${await Helper.amountFormat(result[i].amount)}` : `+ ${await Helper.amountFormat(result[i].amount)}`, to_id: storeInfo.name,
                            profile_photo: businessData.photo_path, createdAt: result[i].createdAt
                        }];
                    }
                }

                const extra = {};
                extra.limit = LIMIT;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(res, vibecoinTransactionInfo, StatusCodes.OK, res.__('success'), extra);
            } else {
                return Response.successResponseWithoutData(res, res.locals.__('noDataFound'));
            }
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description "This function is for get  wallet balance.."
    * @param req
    * @param res
    */
    getBalance: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            let userInfo = await User.findOne({
                attributes: ['id'],
                where: {
                    id: authUserId,
                    status: {
                        [Op.ne]: DELETE,
                    }
                }
            });

            if (userInfo) {
                let web3Wallet = await Web3Account.findOne({
                    attributes: ['id', 'address'],
                    where: {
                        reference_id: requestParams.id,
                        type: requestParams.type
                    }
                });
                if (web3Wallet) {
                    let balance = await Web3Helper.getBalance(web3Wallet.address);
                    return Response.successResponseData(
                        res,
                        balance,
                        StatusCodes.OK,
                        res.locals.__('userBalanceDetail'),
                        null
                    );
                } else {
                    return Response.errorResponseWithoutData(res, res.locals.__('vibecoinAddressNotExist'), StatusCodes.EXPECTATION_FAILED);
                }

            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('userNotExist'),
                    StatusCodes.EXPECTATION_FAILED,
                );
            }
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description "This function is for get  wallet balance.."
    * @param req
    * @param res
    */
    getRemainingPurchaseLimit: async (req, res) => {
        try {
            const requestParams = req.query;
            if (parseInt(requestParams.type) === VIBECOIN_TRANSFER_TYPE.USER) {
                var userInfo = await User.findOne({
                    attributes: ['id'],
                    where: {
                        id: requestParams.id,
                        status: ACTIVE
                    }
                });
            } else if (requestParams.type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
                var businessInfo = await Business.findOne({
                    attributes: ['id'],
                    where: {
                        id: requestParams.id,
                        status: ACTIVE
                    }
                });
            }

            let reference_id = userInfo === undefined ? businessInfo.id : userInfo.id
            let vibecoinLimit = await Helper.checkVibecoinTransactionLimit(reference_id, VIBECOIN_LIMIT.TYPE.ADMIN_TO_USER);
            if (vibecoinLimit) {
                return Response.successResponseData(
                    res,
                    vibecoinLimit,
                    StatusCodes.OK,
                    res.locals.__('limitBalance'),
                    null
                );
            }

        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description "This function is for transfer vibecoin"
    * @param req
    * @param res
    */
    transferVibecoin: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;
            const validate = transactionValidation(requestParams, res);
            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);
            let userInfo = await User.findOne({
                attributes: ['id', 'email'],
                where: {
                    id: authUserId,
                    status: {
                        [Op.ne]: DELETE,
                    }
                }
            });

            if (userInfo) {
                let web3Wallet = await Web3Account.findOne({
                    attributes: ['id', 'address', 'private_key'],
                    where: {
                        reference_id: requestParams.reference_id,
                        type: requestParams.from_type
                    }
                });

                if (requestParams.from_type === VIBECOIN_TRANSFER_TYPE.STORE) {
                    if (requestParams.referral_id) {
                        await Helper.referralsChecking(requestParams.referral_id, requestParams.amount);
                    }
                }

                if (web3Wallet) {
                    let transferSuccess = await Web3Helper.transaction(false, requestParams.to_address, requestParams.amount, userInfo.id, userInfo.email, web3Wallet.address, web3Wallet.private_key);

                    if (transferSuccess === true) {
                        Web3Helper.transferGasFee(web3Wallet.address);
                        let web3WalletReceiver = await Web3Account.findOne({
                            attributes: ['id', 'reference_id', 'type'],
                            where: {
                                address: requestParams.to_address
                            }
                        });

                        const transaction = {
                            from_id: userInfo.id,
                            to_id: web3WalletReceiver.reference_id,
                            amount: requestParams.amount,
                            from_type: requestParams.from_type,
                            to_type: web3WalletReceiver.type
                        };
                        let transactionInfo = await VibecoinTransaction.create(transaction);
                        if (transactionInfo) {
                            let fromTypeEmail = {}
                            let toTypeNotificationAndEmail = {}
                            let adminDynamicValues = {}
                            let userDynamicValues = {}
                            let userData = null;
                            let businessInfo = null;
                            let businessUserInfo = null;
                            let storeInfo = null;
                            let storeBusinessInfo = null;
                            let userStoreBusinessInfo = null;
                            // from type

                            if (requestParams.from_type === VIBECOIN_TRANSFER_TYPE.USER) {

                                userData = await User.findOne({
                                    attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                    where: {
                                        id: requestParams.reference_id,
                                        status: {
                                            [Op.ne]: DELETE,
                                        }
                                    }
                                });

                                fromTypeEmail.email = userData.email
                                adminDynamicValues.admin_name = userData.full_name;
                                adminDynamicValues.vibecoin_coin = requestParams.amount;
                            } else if (requestParams.from_type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
                                businessInfo = await Business.findOne({
                                    attributes: ['id', 'name', 'user_id'],
                                    where: {
                                        id: requestParams.reference_id
                                    }
                                });
                                if (businessInfo !== null) {
                                    businessUserInfo = await User.findOne({
                                        attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                        where: {
                                            id: businessInfo.user_id,
                                            status: {
                                                [Op.ne]: DELETE,
                                            }
                                        }
                                    });
                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('businessNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                fromTypeEmail.email = businessUserInfo.email

                                adminDynamicValues.admin_name = businessUserInfo.full_name;
                                adminDynamicValues.vibecoin_coin = requestParams.amount;
                            } else if (requestParams.from_type === VIBECOIN_TRANSFER_TYPE.STORE) {
                                storeInfo = await Store.findOne({
                                    attributes: ['id', 'name', 'business_id'],
                                    where: {
                                        id: requestParams.reference_id
                                    }
                                });

                                if (storeInfo !== null) {
                                    storeBusinessInfo = await Business.findOne({
                                        attributes: ['id', 'name', 'user_id'],
                                        where: {
                                            id: storeInfo.business_id
                                        }
                                    });
                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('storeNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                if (storeBusinessInfo !== null) {
                                    userStoreBusinessInfo = await User.findOne({
                                        attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                        where: {
                                            id: storeBusinessInfo.user_id,
                                            status: {
                                                [Op.ne]: DELETE,
                                            }
                                        }
                                    });
                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('businessNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                fromTypeEmail.email = userStoreBusinessInfo.email

                                adminDynamicValues.admin_name = userStoreBusinessInfo.name;
                                adminDynamicValues.vibecoin_coin = requestParams.amount;
                            }

                            // to type
                            let toUserData = null;
                            let toBusinessInfo = null;
                            let toBusinessUserInfo = null;
                            let toStoreInfo = null;
                            let toStoreBusinessInfo = null;
                            let toStoreUserInfo = null;

                            if (web3WalletReceiver.type === VIBECOIN_TRANSFER_TYPE.USER) {

                                toUserData = await User.findOne({
                                    attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                    where: {
                                        id: web3WalletReceiver.reference_id,
                                        status: {
                                            [Op.ne]: DELETE,
                                        }
                                    }
                                });

                                toTypeNotificationAndEmail.email = toUserData.email
                                toTypeNotificationAndEmail.fcm_token = toUserData.fcm_token

                                userDynamicValues.user_name = toUserData.full_name
                                userDynamicValues.You = SUBSCRIPTION_USER_AS_PLURAL
                                userDynamicValues.vibecoin_coin = requestParams.amount
                            } else if (web3WalletReceiver.type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {

                                toBusinessInfo = await Business.findOne({
                                    attributes: ['id', 'name', 'user_id'],
                                    where: {
                                        id: web3WalletReceiver.reference_id
                                    }
                                });

                                if (toBusinessInfo !== null) {
                                    toBusinessUserInfo = await User.findOne({
                                        attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                        where: {
                                            id: toBusinessInfo.user_id,
                                            status: {
                                                [Op.ne]: DELETE,
                                            }
                                        }
                                    });

                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('businessNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                toTypeNotificationAndEmail.email = toBusinessUserInfo.email
                                toTypeNotificationAndEmail.fcm_token = toBusinessUserInfo.fcm_token

                                userDynamicValues.user_name = toBusinessInfo.name
                                userDynamicValues.You = SUBSCRIPTION_USER_AS_PLURAL
                                userDynamicValues.user_detail = `owned by ${toBusinessUserInfo.full_name}`
                                userDynamicValues.vibecoin_coin = requestParams.amount
                            } else if (web3WalletReceiver.type === VIBECOIN_TRANSFER_TYPE.STORE) {
                                toStoreInfo = await Store.findOne({
                                    attributes: ['id', 'name', 'business_id'],
                                    where: {
                                        id: web3WalletReceiver.reference_id
                                    }
                                });

                                if (toStoreInfo !== null) {
                                    toStoreBusinessInfo = await Business.findOne({
                                        attributes: ['id', 'name', 'user_id'],
                                        where: {
                                            id: toStoreInfo.business_id
                                        }
                                    });
                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('storeNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                if (toStoreBusinessInfo !== null) {
                                    toStoreUserInfo = await User.findOne({
                                        attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                                        where: {
                                            id: toStoreBusinessInfo.user_id,
                                            status: {
                                                [Op.ne]: DELETE,
                                            }
                                        }
                                    });
                                } else {
                                    return Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('businessNotFound'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                }

                                toTypeNotificationAndEmail.email = toStoreUserInfo.email
                                toTypeNotificationAndEmail.fcm_token = toStoreUserInfo.fcm_token

                                userDynamicValues.user_name = toStoreInfo.name
                                userDynamicValues.You = SUBSCRIPTION_USER_AS_PLURAL
                                userDynamicValues.user_detail = `owned by ${toStoreUserInfo.full_name}`
                                userDynamicValues.vibecoin_coin = requestParams.amount
                            }

                            // email to admin
                            let emailTemplateModel = await EmailTemplate.findOne({
                                attributes: ['id', 'title', 'subject', 'format'],
                                where: {
                                    type: EMAIL_TEMPLATE_TYPE.VIBECOIN_SENDER,
                                    status: {
                                        [Op.ne]: DELETE
                                    },
                                },
                            });

                            if (userDynamicValues.user_name || userDynamicValues.user_detail) {
                                adminDynamicValues.You = userDynamicValues.user_name,
                                    adminDynamicValues.user_detail = userDynamicValues.user_detail
                            }

                            let adminEmailBody = Helper.emailBody(adminDynamicValues, emailTemplateModel.format);

                            const adminLocals = {
                                appName: Helper.AppName,
                                title: emailTemplateModel.title,
                                format: adminEmailBody
                            };

                            Mailer.sendMail(fromTypeEmail.email, "Vibecoin Sent", Helper.vibecoinTransferTemplate, adminLocals);

                            // email to user
                            let emailUserTemplateModel = await EmailTemplate.findOne({
                                attributes: ['id', 'title', 'subject', 'format'],
                                where: {
                                    type: EMAIL_TEMPLATE_TYPE.VIBECOIN_RECEIVER,
                                    status: {
                                        [Op.ne]: DELETE
                                    },
                                },
                            });

                            let userEmailBody = Helper.emailBody(userDynamicValues, emailUserTemplateModel.format);

                            const userLocals = {
                                appName: Helper.AppName,
                                title: emailUserTemplateModel.title,
                                format: userEmailBody
                            };

                            Mailer.sendMail(toTypeNotificationAndEmail.email, emailUserTemplateModel.subject, Helper.vibecoinTransferTemplate, userLocals);

                            let notification = {
                                title: emailUserTemplateModel.title,
                                body: `You have successfully purchased ${requestParams.amount} dollar vibecoin`,
                            }
                            PushNotification.pushNotification(notification, toTypeNotificationAndEmail.fcm_token);
                        }
                        return Response.successResponseData(
                            res,
                            [],
                            StatusCodes.OK,
                            res.locals.__('BalanceTransferSuccessfully'),
                            null
                        );
                    } else {
                        return Response.errorResponseWithoutData(
                            res,
                            res.locals.__('transferUnsuccessful'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    }
                }
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('userNotExist'),
                    StatusCodes.EXPECTATION_FAILED,
                );
            }
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

   /**
    * @description "This function is for purchase vibecoin"
    * @param req
    * @param res
    */
    purchaseVibecoin: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;
            const validate = purchaseValidation(requestParams, res);
            if (!validate.status) return Response.validationErrorResponseData(res, validate.message, StatusCodes.BAD_REQUEST);

            let userInfo = await User.findOne({
                attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                where: {
                    id: authUserId,
                    status: {
                        [Op.ne]: DELETE,
                    }
                }
            });
            if (userInfo) {
                let adminInfo = await User.findOne({
                    attributes: ['id', 'email', 'first_name', 'last_name', 'full_name'],
                    where: {
                        type: USER_MODEL.TYPE.ADMIN_TYPE,
                        status: {
                            [Op.ne]: DELETE,
                        }
                    }
                });

                let businessInfo = null;
                let businessUserInfo = null;
                if (requestParams.type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
                    businessInfo = await Business.findOne({
                        attributes: ['id', 'name', 'user_id'],
                        where: {
                            user_id: authUserId
                        }
                    });
                    if (businessInfo !== null) {
                        businessUserInfo = await User.findOne({
                            attributes: ['id', 'email', 'first_name', 'last_name', 'full_name', 'fcm_token'],
                            where: {
                                id: businessInfo.user_id,
                                status: {
                                    [Op.ne]: DELETE,
                                }
                            }
                        });
                    } else {
                        return Response.errorResponseWithoutData(
                            res,
                            res.locals.__('businessNotFound'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    }
                }
                let reference_id = (businessInfo && businessInfo.id) ? businessInfo.id : userInfo.id;

                let vibecoinBalance = await Helper.checkVibecoinTransactionLimit(reference_id, requestParams.type);

                if (vibecoinBalance > 0) {
                    let web3Wallet = await Web3Account.findOne({
                        attributes: ['id', 'address'],
                        where: {
                            reference_id: reference_id,
                            type: requestParams.type
                        }
                    });

                    let purchaseSuccess = await Web3Helper.transaction(true, web3Wallet.address, requestParams.amount, adminInfo.id, adminInfo.email);

                    if (purchaseSuccess) {
                        const transaction = {
                            buyer_id: reference_id,
                            amount: requestParams.amount,
                            type: requestParams.type,
                            transaction_id: requestParams.transaction_id,
                            vibecoin_transaction_status: SUCCESS
                        };
                        let transactionInfo = await VibecoinPurchase.create(transaction);
                        if (transactionInfo) {
                            let referralsData = await Referrals.findOne({
                                attributes: ['id', 'from_id', 'to_id', 'promotion_id'],
                                where: {
                                    to_id: reference_id,
                                    is_paid: REFERRALS_MODEL.FALSE,
                                    type: REFERRALS_MODEL.TYPE.REFERRALS
                                }
                            });

                            if (referralsData !== null) {
                                let promotionData = await Promotion.findOne({
                                    attributes: ['id', 'type', 'loyalty_card_id', 'customer_amount', 'customer_referral_amount'],
                                    where: {
                                        id: referralsData.promotion_id,
                                        type: parseInt(PROMOTION_MODEL.TYPE.PAID_REFERRALS)
                                    }
                                });

                                if (promotionData !== null) {
                                    const rewardsObj = {
                                        user_id: parseInt(referralsData.to_id),
                                        promotion_id: parseInt(promotionData.id),
                                        referrals_id: parseInt(referralsData.id),
                                        is_paid: REFERRALS_MODEL.TRUE,
                                        amount: requestParams.amount
                                    };

                                    let rewardData = await Reward.create(rewardsObj);
                                    if (rewardData) {
                                         Referrals.update({ is_paid: REFERRALS_MODEL.TRUE }, {
                                            where: {
                                                to_id: reference_id,
                                                is_paid: REFERRALS_MODEL.FALSE,
                                                type: REFERRALS_MODEL.TYPE.REFERRALS
                                            }
                                        });
                                    }
                                }
                            }
                            if (requestParams.type === VIBECOIN_TRANSFER_TYPE.USER) {
                                // email to admin
                                let emailTemplateModel = await EmailTemplate.findOne({
                                    attributes: ['id', 'title', 'subject', 'format'],
                                    where: {
                                        type: EMAIL_TEMPLATE_TYPE.VIBECOIN_SENDER,
                                        status: {
                                            [Op.ne]: DELETE
                                        },
                                    },
                                });

                                let adminDynamicValues = {
                                    admin_name: adminInfo.full_name,
                                    You: SUBSCRIPTION_USER_AS_PLURAL,
                                    vibecoin_coin: requestParams.amount
                                }

                                let adminEmailBody = Helper.emailBody(adminDynamicValues, emailTemplateModel.format);

                                const adminLocals = {
                                    appName: Helper.AppName,
                                    title: emailTemplateModel.title,
                                    format: adminEmailBody
                                };

                                Mailer.sendMail(adminInfo.email, "Vibecoin Sent", Helper.vibecoinTransferTemplate, adminLocals);

                                // email to user
                                let emailUserTemplateModel = await EmailTemplate.findOne({
                                    attributes: ['id', 'title', 'subject', 'format'],
                                    where: {
                                        type: EMAIL_TEMPLATE_TYPE.VIBECOIN_RECEIVER,
                                        status: {
                                            [Op.ne]: DELETE
                                        },
                                    },
                                });

                                let userDynamicValues = {
                                    user_name: userInfo.full_name,
                                    You: SUBSCRIPTION_USER_AS_PLURAL,
                                    vibecoin_coin: requestParams.amount
                                }

                                let userEmailBody = Helper.emailBody(userDynamicValues, emailUserTemplateModel.format);

                                const userLocals = {
                                    appName: Helper.AppName,
                                    title: emailUserTemplateModel.title,
                                    format: userEmailBody
                                };

                                Mailer.sendMail(userInfo.email, emailUserTemplateModel.subject, Helper.vibecoinTransferTemplate, userLocals);

                                let notification = {
                                    title: emailUserTemplateModel.title,
                                    body: `You have successfully purchased ${requestParams.amount} dollar vibecoin`,
                                }
                                PushNotification.pushNotification(notification, userInfo.fcm_token);

                            } else if (requestParams.type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
                                // email to admin
                                let emailTemplateModel = await EmailTemplate.findOne({
                                    attributes: ['id', 'title', 'subject', 'format'],
                                    where: {
                                        type: EMAIL_TEMPLATE_TYPE.VIBECOIN_SENDER,
                                        status: {
                                            [Op.ne]: DELETE
                                        },
                                    },
                                });

                                let adminDynamicValues = {
                                    admin_name: adminInfo.full_name,
                                    You: SUBSCRIPTION_USER_AS_PLURAL,
                                    vibecoin_coin: requestParams.amount
                                }

                                let adminEmailBody = Helper.emailBody(adminDynamicValues, emailTemplateModel.format);

                                const adminLocals = {
                                    appName: Helper.AppName,
                                    title: emailTemplateModel.title,
                                    format: adminEmailBody
                                };

                                Mailer.sendMail(adminInfo.email, "Vibecoin Sent", Helper.vibecoinTransferTemplate, adminLocals);

                                // email to user
                                let emailUserTemplateModel = await EmailTemplate.findOne({
                                    attributes: ['id', 'title', 'subject', 'format'],
                                    where: {
                                        type: EMAIL_TEMPLATE_TYPE.VIBECOIN_RECEIVER,
                                        status: {
                                            [Op.ne]: DELETE
                                        },
                                    },
                                });

                                let userDynamicValues = {
                                    user_name: businessInfo.name,
                                    You: SUBSCRIPTION_USER_AS_PLURAL,
                                    user_detail: `owned by ${businessUserInfo.full_name}`,
                                    vibecoin_coin: requestParams.amount
                                }

                                let userEmailBody = Helper.emailBody(userDynamicValues, emailUserTemplateModel.format);

                                const userLocals = {
                                    appName: Helper.AppName,
                                    title: emailUserTemplateModel.title,
                                    format: userEmailBody
                                };

                                Mailer.sendMail(businessUserInfo.email, emailUserTemplateModel.subject, Helper.vibecoinTransferTemplate, userLocals);
                                let notification = {
                                    title: emailUserTemplateModel.title,
                                    body: `You have successfully purchased ${requestParams.amount} dollar vibecoin`,
                                }
                                PushNotification.pushNotification(notification, businessUserInfo.fcm_token);
                            }
                            return Response.successResponseWithoutData(
                                res,
                                res.locals.__('VibecoinPurchasedSuccessfully'),
                            );
                        }
                    }
                } else {
                    return Response.errorResponseWithoutData(
                        res,
                        res.locals.__('limitExceeded'),
                        StatusCodes.EXPECTATION_FAILED,
                    );
                }
            } else {
                return Response.errorResponseWithoutData(
                    res,
                    res.locals.__('userNotExist'),
                    StatusCodes.EXPECTATION_FAILED,
                );
            }
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },
}
