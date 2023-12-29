const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const moment = require('moment');
const Helper = require('../../services/Helper');
const Web3Helper = require('../../services/Web3Helper');
const S3FileUpload = require('../../services/s3FileUpload');
const { ACTIVE, BUSINESS_MODEL, DELETE, LIMIT, INACTIVE, FOLLOW, ORDER_BY, VIBECOIN_TRANSFER_TYPE, REFERRALS_MODEL, SUBSCRIPTION_TYPE_BY, PLAN_TYPE, PLAN_FEATURES } = require('../../services/Constants');
const {
    addBusinessValidation,
    editBusinessValidation,
    followUnfollowStoreValidation
} = require('../../services/UserValidation');
const { Business, User, Follow, sequelize, Web3Account, LoyaltyCard, Store, Promotion, Upvotes, VibecoinTransaction, Referrals, GasFeeTransfer } = require('../../models');

module.exports = {

    /**
     * @description This function is to get Store Performance analytics.
     * @param req
     * @param res
     */
    storePerformanceAnalytics: async (req, res) => {
        try {
            const requestParams = req.query;
            const { authUserId } = req;

            let subscriptionType = await Helper.checkSubscriptionPlan(requestParams.store_id, SUBSCRIPTION_TYPE_BY.STORE, PLAN_FEATURES.ANALYTICS);

            let storeInfo = await Store.findOne({
                attributes: ['id', 'business_id'],
                where: {
                    id: requestParams.store_id,
                    status: ACTIVE,
                }
            });

            var businessInfo = null
            if (storeInfo) {
                businessInfo = await Business.findOne({
                    attributes: ['id'],
                    where: {
                        id: storeInfo.business_id,
                        user_id: authUserId,
                        status: ACTIVE,
                    }
                });
            }

            if (businessInfo) {
                if (subscriptionType !== undefined && subscriptionType.planFeaturesInfo.access_type === PLAN_TYPE.ACCESS_TYPE.YES) {

                    let promotionIDs = null;
                    let loyaltyCardData = await LoyaltyCard.findAll({
                        attributes: ['id', 'business_id'],
                        where: {
                            business_id: storeInfo.business_id,
                            status: ACTIVE
                        },
                    });

                    let loyaltyCardIDs = loyaltyCardData ? loyaltyCardData.map((loyaltyCard) => loyaltyCard.id) : [];

                    let promotionData = await Promotion.findAll({
                        attributes: ['id', 'loyalty_card_id'],
                        where: {
                            loyalty_card_id: { [Op.in]: loyaltyCardIDs },
                            status: ACTIVE
                        },
                    });

                    promotionIDs = promotionData ? promotionData.map((promotion) => promotion.id) : [];

                    // counts of upvotes
                    let upvotesData = await Upvotes.count({
                        where: {
                            promotion_id: { [Op.in]: promotionIDs },
                            createdAt: {
                                [Op.gte]: moment().subtract(BUSINESS_MODEL.ANALYTICS_LAST_DAYS, 'days').toDate(),
                            }
                        },
                    });

                    // counts of QrCodesScan
                    let QrCodesScan = await VibecoinTransaction.count({
                        where: {
                            from_type: VIBECOIN_TRANSFER_TYPE.STORE,
                            from_id: { [Op.in]: promotionIDs },
                            createdAt: {
                                [Op.gte]: moment().subtract(BUSINESS_MODEL.ANALYTICS_LAST_DAYS, 'days').toDate(),
                            }
                        },
                    });

                    // counts of referrals
                    let referrals = await Referrals.count({
                        where: {
                            type: REFERRALS_MODEL.TYPE.REFERRALS,
                            promotion_id: { [Op.in]: promotionIDs },
                            createdAt: {
                                [Op.gte]: moment().subtract(BUSINESS_MODEL.ANALYTICS_LAST_DAYS, 'days').toDate(),
                            }
                        },
                    });

                    // counts of share
                    let shares = await Referrals.count({
                        where: {
                            type: REFERRALS_MODEL.TYPE.UPVOTES,
                            promotion_id: { [Op.in]: promotionIDs },
                            createdAt: {
                                [Op.gte]: moment().subtract(BUSINESS_MODEL.ANALYTICS_LAST_DAYS, 'days').toDate(),
                            }
                        },
                    });

                    let analyticsCount = {
                        upvotes_count: upvotesData,
                        qr_code_scan_count: QrCodesScan,
                        referrals_count: referrals,
                        shares: shares
                    }

                    return Response.successResponseData(
                        res,
                        analyticsCount,
                        StatusCodes.OK,
                        res.__('success')
                    );

                } else {
                    return Response.errorResponseWithoutData(res, res.locals.__('upgradeSubscriptionPlan'), StatusCodes.EXPECTATION_FAILED);
                }
            } else {
                return Response.errorResponseWithoutData(res, res.locals.__('noStoreExist'), StatusCodes.EXPECTATION_FAILED);
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
     * @description This function is to get business list.
     * @param req
     * @param res
     */
    businessList: async (req, res) => {
        try {
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            let query = {
                user_id: req.authUserId,
                status: {
                    [Op.in]: [ACTIVE, INACTIVE],
                },
            };

            if (requestParams.search && requestParams.search !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        name: {
                            [Op.like]: `%${requestParams.search}%`,
                        },
                    },
                }
            }

            let sorting = [['updatedAt', ORDER_BY.DESC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }
            let data = await Business.findAndCountAll({
                attributes: ['id', 'user_id', 'name', 'fund', 'photo', 'photo_path', 'description', 'status'],
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
                return Response.successResponseData(
                    res,
                    result,
                    StatusCodes.OK,
                    res.__('success'),
                    extra
                );
            } else {
                return Response.successResponseData(res, [], StatusCodes.OK, res.locals.__('noDataFound'));
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
     * @description This function is to get followed or unfollowed business list.
     * @param req
     * @param res
     */
    getUnfollowBusiness: async (req, res) => {
        try {
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            let query = {
                status: ACTIVE
            };

            if (requestParams.search && requestParams.search !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        name: {
                            [Op.like]: `%${requestParams.search}%`,
                        },
                    },
                }
            }
            let sorting = [['updatedAt', ORDER_BY.DESC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }
            let data = null;
            if (requestParams.hasOwnProperty("follow") && requestParams.follow === FOLLOW.TRUE) {
                data = await Business.findAndCountAll({
                    attributes: ['id', 'user_id', 'name', 'fund', 'photo', 'description', 'created_ip', 'updated_ip', 'status', 'createdAt', 'updatedAt'],
                    include: [{
                        model: Follow,
                        attributes: ['id', 'business_id'],
                        where: { user_id: req.authUserId },
                    }],
                    where: query,
                });
            } else {
                query = {
                    user_id: req.authUserId,
                }
                let followData = await Follow.findAll({
                    attributes: ['id', 'business_id'],
                    where: query,
                });

                let businessIDs = followData && followData ? followData.map((follows) => follows.business_id) : [];

                if (businessIDs) {
                    data = await Business.findAndCountAll({
                        attributes: ['id', 'user_id', 'name', 'fund', 'photo', 'photo_path', 'description', 'status'],
                        where: {
                            user_id: {
                                [Op.ne]: req.authUserId
                            },
                            status: ACTIVE,
                            id: { [Op.notIn]: businessIDs }
                        },
                        order: sorting,
                        offset: offset,
                        limit: LIMIT,
                        distinct: true
                    });
                }
            }
            if (data.rows.length > 0) {
                const result = data.rows;
                const extra = {};
                extra.limit = LIMIT;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(
                    res,
                    result,
                    StatusCodes.OK,
                    res.__('success'),
                    extra
                );
            } else {
                return Response.successResponseData(res, [], StatusCodes.OK, res.locals.__('noDataFound'));
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
     * @description "This function is used to add business."
     * @param req
     * @param res
     */
    addBusiness: async (req, res) => {
        try {
            const requestParams = req.fields;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // below function will validate all the params field
            const validate = await addBusinessValidation(requestParams, res);
            if (validate === true) {
                let isImageExist = false;
                let imageName
                if (req.files.photo && req.files.photo.size > 0) {
                    isImageExist = true;
                    await Helper.imageValidation(req, res, req.files.photo);
                    await Helper.imageSizeValidation(req, res, req.files.photo.size);
                }
                const BusinessObj = {
                    user_id: req.authUserId,
                    ...requestParams,
                    created_ip: SYSTEM_IP,
                    status: ACTIVE
                };
                if (isImageExist) {
                    imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.photo.name));
                    BusinessObj.photo = `${BUSINESS_MODEL.PHOTO}/${imageName}`;
                }

                let businessCreated = await Business.create(BusinessObj);
                if (businessCreated) {
                    if (isImageExist) {
                        await S3FileUpload.uploadImageS3(req.files.photo.path, imageName, BUSINESS_MODEL.PHOTO, res);
                    }

                    let userResult = await User.findOne({
                        attributes: ['id', 'email'],
                        where: {
                            id: req.authUserId,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });
                    if (userResult) {
                        // Create Web3 account of business
                        let accountData = await Web3Helper.createAccount(userResult.id, userResult.email);
                        if (typeof (accountData) !== 'undefined') {
                            let Web3AccountObj = {
                                reference_id: businessCreated.id,
                                address: accountData.address,
                                private_key: accountData.encryptKey,
                                type: VIBECOIN_TRANSFER_TYPE.BUSINESS
                            };
                            let web3Wallet = await Web3Account.create(Web3AccountObj);
                            if (web3Wallet) {
                                await GasFeeTransfer.create({ address: web3Wallet.address });
                            }
                        }
                    }
                    let businessData = {
                        business_id: businessCreated.id
                    }

                    return Response.successResponseData(res, businessData, StatusCodes.OK, res.__('BusinessAddedSuccessfully'));
                }
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
     * @description "This function is used to edit business."
     * @param req
     * @param res
     */
    editBusiness: async (req, res) => {
        try {
            const requestParams = req.fields;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // below function will validate all the params field
            const validate = await editBusinessValidation(requestParams, res);
            if (validate) {
                let isImageExist = false;
                let imageName;
                if (req.files.photo && req.files.photo.size > 0) {
                    isImageExist = true;
                    await Helper.imageValidation(req, res, req.files.photo);
                    await Helper.imageSizeValidation(req, res, req.files.photo.size);
                }
                if (requestParams.id) {
                    let businessInfo = await Business.count({
                        where: {
                            id: requestParams.id,
                            user_id: req.authUserId,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });
                    if (businessInfo) {
                        const BusinessObj = {
                            ...requestParams,
                            updated_ip: SYSTEM_IP,
                        };
                        delete BusinessObj.id;
                        if (isImageExist) {
                            imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.photo.name));
                            BusinessObj.photo = `${BUSINESS_MODEL.PHOTO}/${imageName}`
                        }

                        await Business.update(BusinessObj, {
                            where: { id: requestParams.id }
                        });

                        if (isImageExist) {
                            await S3FileUpload.uploadImageS3(req.files.photo.path, imageName, BUSINESS_MODEL.PHOTO, res);
                        }

                        return Response.successResponseWithoutData(res, res.__('businessUpdatedSuccessfully'), StatusCodes.OK);

                    } else {
                        return Response.errorResponseWithoutData(res, res.locals.__('businessNotExist'), StatusCodes.EXPECTATION_FAILED,);
                    }
                }
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
     * @description "This function is used to follow or unfollow store."
     * @param req
     * @param res
     */
    followUnfollow: async (req, res) => {
        try {
            const requestParams = req.body;
            const validate = await followUnfollowStoreValidation(requestParams, res);
            if (validate) {
                let businessData = await Business.count({
                    where: {
                        id: requestParams.business_id,
                        user_id: req.authUserId,
                    }
                });
                if (businessData) {
                    return Response.successResponseWithoutData(res, res.__('couldNotFollow'), StatusCodes.OK);
                } else {
                    let businessExist = await Business.count({
                        where: {
                            id: requestParams.business_id
                        }
                    });
                    if (businessExist) {
                        let followInfo = await Follow.findOne({
                            attributes: ['id', 'business_id'],
                            where: {
                                business_id: requestParams.business_id,
                                user_id: req.authUserId
                            }
                        });
                        if (followInfo) {
                            let isFollowUpdated = await Follow.destroy({
                                where: { business_id: followInfo.business_id, user_id: req.authUserId }
                            });
                            if (isFollowUpdated) {
                                return Response.successResponseWithoutData(res, res.__('BusinessUnFollowedSuccessfully'), StatusCodes.OK);
                            }
                        } else {

                            let followData = await Follow.create({
                                user_id: req.authUserId,
                                business_id: requestParams.business_id,
                            });
                            if (followData) {
                                return Response.successResponseWithoutData(res, res.__('BusinessFollowedSuccessfully'), StatusCodes.OK);
                            }

                        }
                    } else {
                        return Response.successResponseWithoutData(res, res.__('businessNotExist'), StatusCodes.OK);
                    }
                }

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
