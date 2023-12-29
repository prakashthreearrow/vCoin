const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const moment = require('moment');
const Response = require('../../services/Response');
const {
    addEditStoreValidation
} = require('../../services/UserValidation');
const Helper = require('../../services/Helper');
const Web3Helper = require('../../services/Web3Helper');
const S3FileUpload = require('../../services/s3FileUpload');
const { LIMIT, ACTIVE, INACTIVE, DELETE, ORDER_BY, GEOGRAPHICAL_DISTANCE, CHAT_IMAGE, VIBECOIN_TRANSFER_TYPE, SUBSCRIPTION_TYPE_BY, PLAN_FEATURES, PLAN_TYPE } = require('../../services/Constants');
const { Store, Address, Business, sequelize, User, Web3Account, StorePlan, Plan, StorePlanSubscription, FeaturesAccessByPlan, GasFeeTransfer } = require('../../models');

module.exports = {

    /**
     * @description This function is to get store list.
     * @param req
     * @param res
     */
    storeList: async (req, res) => {
        try {
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;
            const offset = (pageNo - 1) * LIMIT;
            let query = {
                status: ACTIVE,
            };
            if (requestParams.business_id && requestParams.business_id !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        business_id: {
                            [Op.eq]: requestParams.business_id
                        }
                    },
                    [Op.and]: {
                        status: {
                            [Op.in]: [ACTIVE, INACTIVE],
                        }
                    },
                }
            }

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
            let data = await Store.findAndCountAll({
                attributes: ['id', 'business_id', 'name', 'admin_email', 'address_id', 'description', 'updatedAt'],
                where: query,
                include: [{
                    model: Address,
                    attributes: ['id', 'apt_suite', 'street_address', 'city', 'country', 'latitude', 'longitute'],
                },
                {
                    model: StorePlan, attributes: ['id', 'store_id', 'plan_id', 'subscribtion_id', 'subscription_end_date'],
                    include: [{
                        model: Plan, attributes: ['id', 'title'],
                        include: [{
                            model: FeaturesAccessByPlan, attributes: ['id', 'access_type']
                        }]
                    },
                    {
                        model: StorePlanSubscription, attributes: ['id', 'store_plan_id', 'event_id', 'invoice_id', 'period_end']
                    }],
                }],
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
     * @description This function is to get store list by geo coordinate of lat and long.
     * @param req
     * @param res
     */
    nearByStoreList: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo =
                requestParams.page && requestParams.page > 0
                    ? parseInt(requestParams.page, 10)
                    : 1;

            const offset = (pageNo - 1) * LIMIT;
            const limit = pageNo * LIMIT;

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
            let sorting = [['updatedAt', ORDER_BY.ASC]];
            if (requestParams.order_by && requestParams.order_by !== '') {
                sorting = [
                    [
                        requestParams.order_by,
                        requestParams.direction ? requestParams.direction : ORDER_BY.DESC,
                    ],
                ]
            }
            let addressInfo = null;
            let userInfo = await User.findOne({
                attributes: ['id', 'address_id'],
                where: {
                    id: authUserId,
                    status: {
                        [Op.ne]: DELETE
                    }
                }
            });

            if (userInfo) {
                addressInfo = await Address.findOne({
                    attributes: ['id', 'apt_suite', 'street_address', 'city', 'country', 'latitude', 'longitute'],
                    where: {
                        id: userInfo.address_id,
                        status: {
                            [Op.ne]: DELETE
                        }
                    },
                });
            }

            // find all the subscription plans
            let current_time = new Date();
            var storePlanData = await StorePlan.findAll({
                attributes: ['id', 'store_id'],
                where: {
                    subscription_end_date: {
                        [Op.gt]: current_time,
                    }
                },
                distinct: true
            });

            let storeIDs = storePlanData && storePlanData ? storePlanData.map((storePlan) => storePlan.store_id) : [];

            query = {
                ...query,
                id: {
                    [Op.in]: storeIDs,
                }
            };

            let storeInfo = null;
            if (addressInfo) {
                storeInfo = await Store.findAndCountAll({
                    attributes: ['id', 'business_id', 'name', 'admin_email', 'address_id', 'description'],
                    where: query,
                    include: [{
                        model: Address,
                        attributes: ['id', 'apt_suite', 'street_address', 'city', 'country', 'latitude', 'longitute', [sequelize.literal("3959 * acos(cos(radians(" + addressInfo.latitude + ")) * cos(radians(latitude)) * cos(radians(" + addressInfo.longitute + ") - radians(longitute)) + sin(radians(" + addressInfo.latitude + ")) * sin(radians(latitude)))"), 'distance']],
                    }],
                    order: sorting,
                    distinct: true
                });
            } else {
                storeInfo = await Store.findAndCountAll({
                    attributes: ['id', 'business_id', 'name', 'admin_email', 'address_id', 'description'],
                    where: query,
                    order: sorting,
                    distinct: true
                });
            }

            if (storeInfo.rows.length > 0) {
                const result = storeInfo.rows;
                let storeResult = result.filter((storeDetails) =>
                    storeDetails.Address ? storeDetails.Address.dataValues.distance < GEOGRAPHICAL_DISTANCE : ''
                )

                let storeResultPaginationData = await Helper.pagination(offset, limit, storeResult);


                const extra = {};
                extra.limit = LIMIT;
                extra.total = storeResult.length;
                extra.page = pageNo;
                return Response.successResponseData(res, storeResultPaginationData, StatusCodes.OK, res.__('success'), extra);
            } else {
                return Response.successResponseWithoutData(res, res.locals.__('noStoreDataFound'));
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
     * @description "This function is used to add store."
     * @param req
     * @param res
     */
    addStore: async (req, res) => {
        try {
            const requestParams = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = await addEditStoreValidation(requestParams, res);
            if (validate) {

                let businessInfo = await Business.count({
                    where: {
                        id: requestParams.business_id
                    }
                });

                if (businessInfo) {
                    const AddressObj = {
                        ...requestParams,
                        created_ip: SYSTEM_IP,
                        status: ACTIVE
                    };
                    let addressInfo = await Address.create(AddressObj);
                    if (addressInfo) {
                        const StoreObj = {
                            ...requestParams,
                            address_id: addressInfo.id,
                            created_ip: SYSTEM_IP,
                            status: ACTIVE
                        };
                        let storeInfo = await Store.create(StoreObj);
                        if (storeInfo) {

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
                                // Create Web3 account of store
                                let accountData = await Web3Helper.createAccount(userResult.id, userResult.email);

                                if (typeof (accountData) !== 'undefined') {
                                    let Web3AccountObj = {
                                        reference_id: storeInfo.id,
                                        address: accountData.address,
                                        private_key: accountData.encryptKey,
                                        type: VIBECOIN_TRANSFER_TYPE.STORE
                                    };
                                    let web3Wallet = await Web3Account.create(Web3AccountObj);
                                    if (web3Wallet) {
                                        await GasFeeTransfer.create({ address: web3Wallet.address });
                                    }
                                }
                            }
                            return Response.successResponseData(res, storeInfo, StatusCodes.OK, res.__('StoreAddedSuccessfully'));
                        }
                    }
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('businessNotExist'),
                        StatusCodes.EXPECTATION_FAILED,
                    );
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
     * @description "This function is used to edit store."
     * @param req
     * @param res
     */
    editStore: async (req, res) => {
        try {
            const requestParams = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            const validate = await addEditStoreValidation(requestParams, res);
            if (validate) {
                if (requestParams.id) {
                    const StoreObj = {
                        ...requestParams,
                        updated_ip: SYSTEM_IP
                    };
                    delete StoreObj.id;
                    let storeInfo = await Store.findOne({
                        attributes: ['id', 'address_id'],
                        where: {
                            id: requestParams.id,
                            status: {
                                [Op.ne]: DELETE
                            }
                        }
                    });
                    if (storeInfo) {
                        let isStoreUpdated = await Store.update(StoreObj, {
                            where: { id: requestParams.id },
                        });
                        if (isStoreUpdated) {
                            const AddressObj = {
                                ...requestParams,
                                updated_ip: SYSTEM_IP
                            };
                            delete AddressObj.id;
                            let addressInfo = await Address.findOne({
                                attributes: ['id'],
                                where: {
                                    id: storeInfo.address_id,
                                    status: {
                                        [Op.ne]: DELETE
                                    }
                                }
                            });
                            if (addressInfo) {
                                let isAddressUpdated = await Address.update(AddressObj, {
                                    where: { id: storeInfo.address_id },
                                });
                                if (isAddressUpdated) {
                                    return Response.successResponseWithoutData(res, res.__('storeUpdatedSuccessfully'), StatusCodes.OK);
                                }
                            } else {
                                return Response.errorResponseWithoutData(res, res.locals.__('addressNotExist'), StatusCodes.EXPECTATION_FAILED,);
                            }
                        }
                    } else {
                        return Response.errorResponseWithoutData(res, res.locals.__('storeNotExist'), StatusCodes.EXPECTATION_FAILED,);
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
     * @description "This function is used to upload image in s3 chat directory."
     * @param req
     * @param res
     */
    ChatFirebaseStoreFiles: async (req, res) => {
        try {
            let isImageExist = false;
            let imageName
            if (req.files.chatImage && req.files.chatImage.size > 0) {
                isImageExist = true;
                await Helper.imageValidation(req, res, req.files.chatImage);
                await Helper.imageSizeValidation(req, res, req.files.chatImage.size);
            }
            if (isImageExist) {
                imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.chatImage.name));
                await S3FileUpload.uploadImageS3(req.files.chatImage.path, imageName, CHAT_IMAGE, res);
            }
            let chatImagePath = await S3FileUpload.mediaUrlForS3(`${CHAT_IMAGE}/${imageName}`)
            if (chatImagePath) {
                return Response.successResponseData(
                    res,
                    chatImagePath,
                    StatusCodes.OK,
                    res.__('success')
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
