const { Op } = require('sequelize');
const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const {
    promotionAddEditValidation,
    upvotesValidation,
    savePromotionValidation,
    promotionLinkValidation
} = require('../../services/UserValidation');
const { ACTIVE, INACTIVE, PROMOTION_MODEL, DELETE, LIMIT, ORDER_BY, USER_FRIENDS_MODEL, REFERRALS_MODEL, SUBSCRIPTION_TYPE_BY, PLAN_TYPE, PLAN_FEATURES } = require('../../services/Constants');
const Helper = require('../../services/Helper');
const S3FileUpload = require('../../services/s3FileUpload');
const { LoyaltyCard, Promotion, Upvotes, Photos, sequelize, Follow, Business, UserFriend, Referrals } = require('../../models');

module.exports = {

    /**
     * @description This function is to Get post list of promotion.
     * @param req
     * @param res
     */
    postList: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo = requestParams.page && requestParams.page > 0
                ? parseInt(requestParams.page, 10)
                : 1;

            const offset = (pageNo - 1) * LIMIT;

            let date_and_time = moment().format();
            let dateQuery = {
                status: ACTIVE,
                start_date: {
                    [Op.lt]: date_and_time,
                },
                end_date: {
                    [Op.gt]: date_and_time,
                },
            };


            let promotionData = await Business.findAndCountAll({
                attributes: ['id'],
                where: {
                    user_id: authUserId
                },
                include: [{
                    model: LoyaltyCard,
                    attributes: ['id'],
                    include: [{
                        model: Promotion,
                        attributes: ['id'],
                    }],
                }],
            });

            let promotionFilterIDs = promotionData ? promotionData.rows.filter((promo) => promo.LoyaltyCard && promo.LoyaltyCard.Promotion.id).map((promo) => promo.LoyaltyCard.Promotion.id) : null;

            let userFriendData = await UserFriend.findAll({
                attributes: ['id', 'from_id', 'to_id'],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { from_id: authUserId },
                                { to_id: authUserId }
                            ]
                        }
                    ],
                    status: USER_FRIENDS_MODEL.STATUS_TYPE.ACCEPTED
                },
            });

            let userIDs = userFriendData ? userFriendData.map((friends) => friends.to_id === authUserId ? friends.from_id : friends.to_id) : null;

            let upvotesData = await Upvotes.findAndCountAll({
                attributes: ['id', 'promotion_id'],
                where: {
                    user_id: {
                        [Op.in]: userIDs,
                    },
                    promotion_id: {
                        [Op.notIn]: promotionFilterIDs,
                    }
                },
                include: [{
                    model: Promotion,
                    attributes: ['id', 'customer_amount'],
                    where: dateQuery
                }],
            });

            if (upvotesData.rows.length > 0) {
                const result = upvotesData.rows;
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        upvotesData.rows[key] = { ...upvotesData.rows[key].dataValues.Promotion.dataValues, 'isFollowed': "false" };
                    }
                })

                const extra = {};
                extra.limit = LIMIT;
                extra.total = upvotesData.count;
                extra.page = pageNo;
                return Response.successResponseData(res, upvotesData, StatusCodes.OK, res.__('success'), extra);
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
     * @description This function is to Get news feed list.
     * @param req
     * @param res
     */
    getNewsFeed: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            const limit = pageNo * LIMIT;

            let followQuery = {
                user_id: authUserId
            };

            let date_and_time = moment().format();

            let dateQuery = {
                status: ACTIVE,
                start_date: {
                    [Op.lt]: date_and_time,
                },
                end_date: {
                    [Op.gt]: date_and_time,
                },
            };

            let promotionData = null;
            let upvotesData = null;
            let followData = await Follow.findAndCountAll({
                attributes: ['id', 'business_id'],
                where: followQuery
            });

            let businessIDs = followData.count !== 0 ? followData.rows.map((follows) => follows.business_id) : null;

            if (businessIDs !== null) {
                let loyaltyCardData = await LoyaltyCard.findAll({
                    attributes: ['id'],
                    where: {
                        business_id: {
                            [Op.in]: businessIDs,
                        },
                        status: ACTIVE
                    },
                });

                let loyaltyCardIDs = loyaltyCardData.count !== 0 ? loyaltyCardData.map((loyaltyCards) => loyaltyCards.id) : null;

                if (loyaltyCardIDs !== null) {
                    promotionData = await Promotion.findAndCountAll({
                        attributes: ['id', 'loyalty_card_id', 'type', 'customer_amount', 'customer_referral_amount', 'start_date', 'end_date', 'description', 'qr_code', 'photo', 'photo_path', 'createdAt'],
                        where: {
                            loyalty_card_id: {
                                [Op.in]: loyaltyCardIDs,
                            },
                            ...dateQuery,
                            status: ACTIVE
                        },
                        distinct: true
                    });

                    let promotionIDs = promotionData ? promotionData.rows.map((promotions) => promotions.id) : [];

                    upvotesData = await Upvotes.findAndCountAll({
                        attributes: ['id', 'promotion_id'],
                        where: {
                            promotion_id: {
                                [Op.in]: promotionIDs,
                            },
                            user_id: authUserId
                        },
                    });

                }
            }

            let referralsData = await Referrals.findAndCountAll({
                attributes: ['id', 'to_id', 'createdAt'],
                where: {
                    to_id: authUserId,
                },
                include: [{
                    model: Promotion,
                    attributes: ['id', 'loyalty_card_id', 'type', 'customer_amount', 'customer_referral_amount', 'start_date', 'end_date', 'description', 'qr_code', 'photo', 'photo_path'],
                    where: dateQuery
                }],
            });

            let promotionIDs = referralsData ? referralsData.rows.map((referrals) => referrals.Promotion.id) : [];

            let upvotesInfo = await Upvotes.findAndCountAll({
                attributes: ['id', 'promotion_id'],
                where: {
                    promotion_id: {
                        [Op.in]: promotionIDs,
                    },
                    user_id: authUserId
                },
            });

            if (referralsData !== undefined && referralsData.rows.length > 0) {
                const result = referralsData.rows;
                const subResult = upvotesInfo.rows;
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        Object.keys(subResult).forEach((subKey) => {
                            if ({}.hasOwnProperty.call(subResult, subKey)) {
                                if (referralsData.rows[key].Promotion.id == upvotesData.rows[subKey].promotion_id) {
                                    referralsData.rows[key] = { ...referralsData.rows[key].Promotion.dataValues, 'upvotes': "true", 'isFollowed': "false", "createdAt": referralsData.rows[key].createdAt };
                                }
                            }
                        })
                    }
                })
            }

            if (promotionData !== undefined && promotionData.rows.length > 0) {
                const result = promotionData.rows;
                const subResult = upvotesData.rows;
                Object.keys(result).forEach((key) => {
                    if ({}.hasOwnProperty.call(result, key)) {
                        Object.keys(subResult).forEach((subKey) => {
                            if ({}.hasOwnProperty.call(subResult, subKey)) {
                                if (promotionData.rows[key].id == upvotesData.rows[subKey].promotion_id) {
                                    promotionData.rows[key] = { ...promotionData.rows[key].dataValues, 'upvotes': "true", 'isFollowed': "true" };
                                }
                            }
                        })
                    }
                })

            }

            if (promotionData !== undefined) {
                var mergered = [...promotionData.rows, ...referralsData.rows];
            }

            let sorted = mergered !== undefined && mergered.sort((a, b) => { return a.createdAt > b.createdAt ? -1 : 1 })

            if (mergered !== undefined && mergered.length > 0) {
                let newsFeedPaginationData = await Helper.pagination(offset, limit, mergered);
                const extra = {};
                extra.limit = LIMIT;
                extra.total = sorted.length;
                extra.page = pageNo;
                return Response.successResponseData(
                    res,
                    newsFeedPaginationData,
                    StatusCodes.OK,
                    res.__('success'),
                    extra
                )
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
     * @description This function is to get promotion list for business.
     * @param req
     * @param res
     */
    promotionListAsPerBusiness: async (req, res) => {
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
            if (requestParams.business_id && requestParams.business_id !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        business_id: requestParams.business_id,
                    },
                }
            }
            let sorting = [['id', ORDER_BY.DESC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }
            let LoyaltyCardData = await LoyaltyCard.findAll({
                attributes: ['id'],
                where: query
            });

            let loyaltyCardIds = LoyaltyCardData ? LoyaltyCardData.map((loyaltyCardId) => loyaltyCardId.id) : [];
            let data = await Promotion.findAndCountAll({
                attributes: ['id', 'loyalty_card_id', 'id', 'type', 'customer_amount', 'customer_referral_amount', 'start_date', 'end_date', 'description', 'qr_code', 'photo', 'photo_path', 'status', 'createdAt', 'updatedAt'],
                where: {
                    status: ACTIVE,
                    loyalty_card_id: { [Op.in]: loyaltyCardIds }
                },
                order: sorting,
                offset: offset,
                limit: LIMIT,
                distinct: true
            });

            if (data.rows.length > 0) {
                const result = data.rows
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
                )
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
     * @description This function is to get promotion list.
     * @param req
     * @param res
     */
    promotionList: async (req, res) => {
        try {
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            let query = {
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

            var currentDate = new Date();
            query = {
                ...query,
                status: ACTIVE,
                [Op.and]: [
                    {
                        start_date: {
                            [Op.lt]: currentDate,
                        },
                    },
                    {
                        end_date: {
                            [Op.gt]: currentDate,
                        },
                    }
                ]
            };

            let data = await Promotion.findAndCountAll({
                attributes: ['id', 'loyalty_card_id', 'type', 'customer_amount', 'customer_referral_amount', 'start_date', 'end_date', 'description', 'qr_code', 'photo', 'status', 'createdAt', 'updatedAt'],
                include: [{ model: LoyaltyCard }],
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
     * @description "This function is used to add promotion."
     * @param req
     * @param res
     */
    addPromotion: async (req, res) => {
        try {
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const requestParams = req.fields;
            const { authUserId } = req;
            const validate = await promotionAddEditValidation(requestParams, res);
            if (validate) {
                let isPromotionAllowed = false;
                let subscriptionType = await Helper.checkSubscriptionPlan(requestParams.loyalty_card_id, SUBSCRIPTION_TYPE_BY.LOYALTYCARD, PLAN_FEATURES.PROMOTIONS);

                if (subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.LIMITED) {
                    let promotionData = await Promotion.findAndCountAll({
                        attributes: ['id', 'loyalty_card_id'],
                        include: [{
                            model: LoyaltyCard,
                            attributes: ['id', 'business_id'],
                            include: [{
                                model: Business,
                                attributes: ['id', 'user_id'],
                                where: {
                                    status: ACTIVE,
                                    user_id: authUserId
                                }
                            }],
                            where: {
                                status: ACTIVE
                            },
                        }],
                        where: {
                            status: ACTIVE
                        }
                    });
                    if (promotionData.count >= subscriptionType.planFeaturesInfo.limited_value) {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('limitExceeded'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    } else {
                        isPromotionAllowed = true;
                    }

                } else if ((subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.UNLIMITED)
                    || subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.YES) {
                    isPromotionAllowed = true;
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('subscriptionPlanPromotion.'),
                        StatusCodes.EXPECTATION_FAILED,
                    );
                }
                if (isPromotionAllowed) {
                    let imageName = null;
                    let isImageExist = false;
                    if (req.files.photo && req.files.photo.size > 0) {
                        isImageExist = true;
                        await Helper.imageValidation(req, res, req.files.photo);
                        await Helper.imageSizeValidation(req, res, req.files.photo.size);
                    } else {
                        return Response.errorResponseWithoutData(
                            res,
                            res.__('imageIsRequired'),
                            StatusCodes.BAD_REQUEST
                        );
                    }
                    const PromotionCardObj = {
                        ...requestParams,
                        created_ip: SYSTEM_IP,
                        status: ACTIVE
                    };

                    PromotionCardObj.qr_code = `${process.env.QR_CODE}"type:${PromotionCardObj.type},  customer_amount:${PromotionCardObj.customer_amount},  customer_referral_amount:${PromotionCardObj.customer_referral_amount},  start_date:${PromotionCardObj.start_date},  end_date:${PromotionCardObj.end_date}"`//todo - change the QR code logic

                    if (isImageExist) {
                        imageName = await Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.photo.name));
                        PromotionCardObj.photo = `${PROMOTION_MODEL.PHOTO}/${imageName}`;
                    }
                    await Promotion.create(PromotionCardObj);

                    if (isImageExist) {
                        await S3FileUpload.uploadImageS3(req.files.photo.path, imageName, PROMOTION_MODEL.PHOTO, res);
                    }

                    return Response.successResponseWithoutData(res, res.__('PromotionAddedSuccessfully'), StatusCodes.OK);

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
     * @description "This function is used to edit promotion."
     * @param req
     * @param res
     */
    editPromotion: async (req, res) => {
        try {
            const requestParams = req.fields;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = await promotionAddEditValidation(requestParams, res);
            if (validate) {
                let isImageExit = false;
                let imageName = null;;
                if (req.files.photo && req.files.photo.size > 0) {
                    isImageExit = true;
                    await Helper.imageValidation(req, res, req.files.photo);
                    await Helper.imageSizeValidation(req, res, req.files.photo.size);
                } else {
                    return Response.errorResponseData(
                        res,
                        res.__('imageIsRequired'),
                        StatusCodes.BAD_REQUEST
                    );
                }
                if (requestParams.id) {
                    let promotionInfo = await Promotion.count({
                        where: {
                            id: requestParams.id,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });
                    if (promotionInfo) {
                        const PromotionCardObj = {
                            ...requestParams,
                            updated_ip: SYSTEM_IP,
                        };
                        
                        delete PromotionCardObj.id;
                        if (isImageExit) {
                            imageName = await Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.photo.name));
                            PromotionCardObj.photo = `${PROMOTION_MODEL.PHOTO}/${imageName}`
                        }
                        await Promotion.update(PromotionCardObj, { where: { id: requestParams.id } });

                        if (isImageExit) {
                            await S3FileUpload.uploadImageS3(req.files.photo.path, imageName, PROMOTION_MODEL.PHOTO, res);
                        }

                        return Response.successResponseWithoutData(
                            res,
                            res.__('promotionUpdatedSuccessfully'),
                            StatusCodes.OK
                        );

                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('promotionNotExist'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
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
     * @description "This function is used to upvotes."
     * @param req
     * @param res
     */
    upvotes: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;
            const validate = await upvotesValidation(requestParams, res);
            if (validate) {
                const UpvotesObj = {
                    user_id: req.authUserId,
                    promotion_id: requestParams.promotion_id
                }
                let upvotesInfo = await Upvotes.create(UpvotesObj);

                if (upvotesInfo) {
                    let userData = await Promotion.findAll({
                        attributes: ['id', 'loyalty_card_id'],
                        where: {
                            id: upvotesInfo.promotion_id
                        },
                        distinct: true,
                        include: [{
                            model: LoyaltyCard,
                            attributes: ['id', 'business_id'],
                            include: [{
                                model: Business,
                                attributes: ['id', 'user_id'],
                            }],
                        }],
                    });

                    let userIDs = userData && userData.map((userData) => userData.LoyaltyCard.Business.user_id)

                    let userFriendData = await UserFriend.findAll({
                        where: {
                            [Op.or]: [
                                {
                                    from_id: {
                                        [Op.notIn]: userIDs
                                    }
                                },
                                {
                                    to_id: {
                                        [Op.notIn]: userIDs
                                    }
                                }
                            ],
                        },
                    });

                    let userFriendIDs = userFriendData && userFriendData.map((userFriendData) => userFriendData.to_id)

                    var referralsInsertData = [];
                    userFriendIDs.map(async (referrals) => {
                        referralsInsertData = [...referralsInsertData, { from_id: authUserId, to_id: referrals, promotion_id: upvotesInfo.promotion_id, type: REFERRALS_MODEL.TYPE.UPVOTES }];
                    })
                    let referralsObjInfo = await Referrals.bulkCreate(referralsInsertData);
                    if (referralsObjInfo) {
                        return Response.successResponseWithoutData(res, res.__('UpvotedSuccessfully'), StatusCodes.OK);
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
     * @description "This function is used to save promotion referrals."
     * @param req
     * @param res
     */
    promotionReferralsLink: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;
            const validate = await promotionLinkValidation(requestParams, res);
            if (validate) {
                let private_key = `${requestParams.promotion_id}-${authUserId}`
                let encryptData = await Helper.encryptData(private_key);
                let link = `${process.env.DOMAIN_NAME}${encryptData}`
                return Response.successResponseData(res, link, StatusCodes.OK, res.__('linkGeneratedSuccessfully'));
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
     * @description "This function is used to save promotion referrals."
     * @param req
     * @param res
     */
    savePromotionReferrals: async (req, res) => {
        try {
            const requestParams = req.body;
            const validate = await savePromotionValidation(requestParams, res);
            if (validate) {

                let encryptData = await Helper.decryptData(requestParams.encrypted.split('/')[3]);

                const referralsObj = {
                    promotion_id: encryptData.split('-')[0],
                    from_id: encryptData.split('-')[1],
                    to_id: requestParams.to_id,
                    type: REFERRALS_MODEL.TYPE.REFERRALS,
                };

                let referralsObjInfo = await Referrals.create(referralsObj);
                if (referralsObjInfo) {
                    return Response.successResponseWithoutData(res, res.__('savePromotionAddedSuccessfully'), StatusCodes.OK);
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
