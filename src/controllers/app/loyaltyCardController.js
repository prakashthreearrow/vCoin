const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const {
    addLoyaltyCardValidation,
    editLoyaltyCardValidation
} = require('../../services/UserValidation');
const S3FileUpload = require('../../services/s3FileUpload');
const Helper = require('../../services/Helper');
const { ACTIVE, DELETE, LIMIT, LOYALTY_CARD_MODEL, INACTIVE, ORDER_BY, SUBSCRIPTION_TYPE_BY, PLAN_TYPE, PLAN_FEATURES } = require('../../services/Constants');
const { Photos, Follow, Store, LoyaltyCard, Business, User, StorePlan } = require('../../models');

module.exports = {

    /**
     * @description This function is to get loyaltyCard list.
     * @param req
     * @param res
     */
    loyaltyCardList: async (req, res) => {
        try {
            const requestParams = req.query;
            const { authUserId } = req;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;

            let query = {
                status: ACTIVE,
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

            let data = {};
            if (requestParams.business_id) {
                query = {
                    ...query,
                    business_id: {
                        [Op.in]: [requestParams.business_id],
                    },
                };
                data = await LoyaltyCard.findAndCountAll({
                    include: [{
                        model: Photos,
                        attributes: ['id', 'loyalty_card_id', 'photo', 'createdAt', 'updatedAt'],
                    }],
                    where: query,
                    order: [['updatedAt', ORDER_BY.DESC]],
                    offset: offset,
                    limit: LIMIT,
                    distinct: true
                });

            } else {
                // find all the subscription plans
                let current_time = new Date();
                let StorePlanData = await StorePlan.findAll({
                    attributes: ['id', 'store_id'],
                    where: {
                        subscription_end_date: {
                            [Op.gt]: current_time,
                        }
                    },
                });

                let storePlanIDs = StorePlanData && StorePlanData ? StorePlanData.map((storePlan) => storePlan.store_id) : [];

                let subQuery = {
                    user_id: authUserId,
                }
                let followData = await Follow.findAll({
                    attributes: ['id', 'business_id'],
                    where: subQuery,
                });

                let businessIDsFollow = followData.length > 0 ? followData.map((follows) => follows.business_id) : [];

                query = {
                    ...query,
                    [Op.and]: [
                        {
                            store_id: {
                                [Op.in]: storePlanIDs,
                            },
                        },
                        {
                            business_id: {
                                [Op.in]: businessIDsFollow,
                            }
                        }
                    ]
                };

                data = await LoyaltyCard.findAndCountAll({
                    include: [{
                        model: Photos,
                        attributes: ['id', 'loyalty_card_id', 'photo', 'createdAt', 'updatedAt'],
                    }],
                    where: query,
                    order: [['updatedAt', ORDER_BY.DESC]],
                    offset: offset,
                    limit: LIMIT,
                    distinct: true
                });
            }

            if (data.rows.length > 0) {
                const result = data.rows;

                const extra = {};
                extra.limit = LIMIT;
                extra.total = data.count;
                extra.page = pageNo;
                return Response.successResponseData(res, result, StatusCodes.OK, res.__('success'), extra);
            } else {
                return Response.successResponseWithoutData(res, res.locals.__('noLoyaltyCardFound'));
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
     * @description This function is to get loyalty card discover list.
     * @param req
     * @param res
     */
    loyaltyCardDiscover: async (req, res) => {
        try {
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            let query = {};

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

            query = {
                ...query,
                user_id: req.authUserId,
            }
            let followData = await Follow.findAll({
                attributes: ['id', 'business_id'],
                where: query,
            });
            let businessIDsFollow = followData && followData ? followData.map((follows) => follows.business_id) : [];

            let businessData = await Business.findAll({
                attributes: ['id', 'user_id'],
                where: {
                    user_id: {
                        [Op.ne]: req.authUserId
                    },
                    status: ACTIVE,
                    id: { [Op.notIn]: businessIDsFollow }
                },
            });
            let businessIDs = businessData && businessData ? businessData.map((business) => business.id) : [];
            let data = await LoyaltyCard.findAndCountAll({
                attributes: ['id', 'store_id', 'business_id', 'name', 'description', 'createdAt', 'updatedAt'],
                include: [{
                    model: Photos,
                    attributes: ['id', 'loyalty_card_id', 'photo', 'createdAt', 'updatedAt'],
                }],
                where: {
                    status: ACTIVE,
                    business_id: { [Op.in]: businessIDs }
                },
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
            return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    /**
     * @description "This function is used to add loyalty card."
     * @param req
     * @param res
     */
    addLoyaltyCard: async (req, res) => {
        try {
            const requestParams = req.fields;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = await addLoyaltyCardValidation(requestParams, res);
            if (validate) {

                let isImageExist = false;

                if (Object.values(req.files)[0].name && Object.values(req.files)[0].size > 0) {
                    isImageExist = true;
                    await Helper.imageSizeValidation(req, res, Object.values(req.files)[0].size);
                } else {
                    return Response.errorResponseWithoutData(
                        res,
                        res.__('imageIsRequired'),
                        StatusCodes.BAD_REQUEST
                    );
                }

                if (isImageExist) {

                    let storeInfo = await Store.findOne({
                        attributes: ['id', 'business_id'],
                        where: {
                            id: requestParams.store_id
                        }
                    });

                    if (storeInfo) {
                        const LoyaltyCardObj = {
                            ...requestParams,
                            business_id: storeInfo.business_id,
                            created_ip: SYSTEM_IP,
                            status: ACTIVE
                        };
                        let loyaltyCardInfo = await LoyaltyCard.create(LoyaltyCardObj);

                        if (loyaltyCardInfo) {
                            let subscriptionType = await Helper.checkSubscriptionPlan(requestParams.store_id, SUBSCRIPTION_TYPE_BY.STORE, PLAN_FEATURES.PHOTO);

                            if (subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.LIMITED) {

                                let loyaltyCardData = await LoyaltyCard.findAll({
                                    attributes: ['id'],
                                    where: {
                                        store_id: requestParams.store_id,
                                        status: ACTIVE
                                    },
                                });
                                let loyaltyCardIDs = loyaltyCardData && loyaltyCardData ? loyaltyCardData.map((loyaltyCard) => loyaltyCard.id) : [];

                                var photoCount = await Photos.count({
                                    where: {
                                        loyalty_card_id: {
                                            [Op.in]: loyaltyCardIDs
                                        }
                                    }
                                });

                                if (photoCount > parseInt(subscriptionType.planFeaturesInfo.limited_value)) {
                                    Response.errorResponseWithoutData(
                                        res,
                                        res.locals.__('photolimitExceeded'),
                                        StatusCodes.EXPECTATION_FAILED,
                                    );
                                } else {
                                    const filesArray = Object.values(req.files);
                                    if (filesArray.length) {
                                        let remainingLimit = parseInt(subscriptionType.planFeaturesInfo.limited_value) - photoCount;

                                        var photosInsertData = [];
                                        for (let i = 0; i < filesArray.length; i++) {
                                            const imageName = Helper.generateUniqueFileName(Helper.removeSpecialCharacter(filesArray[i].name));
                                            photosInsertData = [...photosInsertData, { loyalty_card_id: loyaltyCardInfo.id, photo: `${LOYALTY_CARD_MODEL.IMAGE}/${imageName}`, created_ip: SYSTEM_IP }];
                                            await S3FileUpload.uploadImageS3(filesArray[i].path, imageName, LOYALTY_CARD_MODEL.IMAGE, res);
                                            if (i === remainingLimit - 1) {
                                                break;
                                            }
                                        }
                                    }

                                    let loyaltyCardObjInfo = await Photos.bulkCreate(photosInsertData);
                                    if (loyaltyCardObjInfo) {
                                        return Response.successResponseWithoutData(res, res.__('LoyaltyCardAddedSuccessfully'), StatusCodes.OK);
                                    }
                                }

                            } else if ((subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.YES
                                || subscriptionType !== undefined && subscriptionType.planFeaturesInfo !== undefined && parseInt(subscriptionType.planFeaturesInfo.access_type) === PLAN_TYPE.ACCESS_TYPE.UNLIMITED)) {
                                const filesArray = Object.values(req.files);
                                if (filesArray.length) {
                                    var photosInsertData = [];
                                    for (let i = 0; i < filesArray.length; i++) {
                                        const imageName = Helper.generateUniqueFileName(Helper.removeSpecialCharacter(filesArray[i].name));
                                        photosInsertData = [...photosInsertData, { loyalty_card_id: loyaltyCardInfo.id, photo: `${LOYALTY_CARD_MODEL.IMAGE}/${imageName}`, created_ip: SYSTEM_IP }];
                                        await S3FileUpload.uploadImageS3(filesArray[i].path, imageName, LOYALTY_CARD_MODEL.IMAGE, res);
                                    }
                                }

                                let loyaltyCardObjInfo = await Photos.bulkCreate(photosInsertData);
                                if (loyaltyCardObjInfo) {
                                    return Response.successResponseWithoutData(res, res.__('LoyaltyCardAddedSuccessfully'), StatusCodes.OK);
                                }
                            } else {
                                Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('subscriptionPlanLoyaltyCard'),
                                    StatusCodes.EXPECTATION_FAILED,
                                );
                            }
                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('storeNotExist'),
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
     * @description "This function is used to edit loyalty card."
     * @param req
     * @param res
     */
    editLoyaltyCard: async (req, res) => {
        try {
            const requestParams = req.fields;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = await editLoyaltyCardValidation(requestParams, res);
            if (validate) {
                let isImageExist = false;

                if (Object.values(req.files)[0].name && (Object.values(req.files)[0].size > 0)) {
                    isImageExist = true;
                    await Helper.imageSizeValidation(req, res, Object.values(req.files)[0].size);
                }

                if (requestParams.id) {

                    let loyaltyCardInfo = await LoyaltyCard.findOne({
                        attributes: ['id'],
                        where: {
                            id: requestParams.id,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });
                    if (loyaltyCardInfo) {
                        const LoyaltyCardObj = {
                            ...requestParams,
                            updated_ip: SYSTEM_IP,
                        };
                        delete loyaltyCardInfo.id;

                        await LoyaltyCard.update(LoyaltyCardObj, { where: { id: requestParams.id } });

                        if (requestParams.delete_photo) {

                            let multipleID = requestParams.delete_photo.split(",")
                            Photos.destroy({
                                where: {
                                    id: {
                                        [Op.in]: multipleID
                                    },
                                    loyalty_card_id: loyaltyCardInfo.id,
                                },
                                attributes: ['id', 'photo'],
                            });
                        }

                        if (isImageExist) {
                            const filesArray = Object.values(req.files);
                            if (filesArray.length) {
                                var photosInsertData = [];
                                filesArray.map(async (file) => {
                                    const imageName = Helper.generateUniqueFileName(Helper.removeSpecialCharacter(file.name));
                                    photosInsertData = [...photosInsertData, { loyalty_card_id: loyaltyCardInfo.id, photo: `${LOYALTY_CARD_MODEL.IMAGE}/${imageName}`, created_ip: SYSTEM_IP }];
                                    await S3FileUpload.uploadImageS3(file.path, imageName, LOYALTY_CARD_MODEL.IMAGE, res);
                                })
                            }
                            await Photos.bulkCreate(photosInsertData);

                            return Response.successResponseWithoutData(res, res.__('LoyaltyCardUpdatedSuccessfully'), StatusCodes.OK);

                        } else {
                            return Response.successResponseWithoutData(res, res.__('LoyaltyCardAddedSuccessfully'), StatusCodes.OK);
                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('loyaltyCardNotExist'),
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
}
