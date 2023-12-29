const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const { ACTIVE, LIMIT, USER_MODEL, USER_FRIENDS_MODEL } = require('../../services/Constants');
const { User, UserFriend } = require('../../models');
const {
    addUserFriendValidation,
    acceptRejectFriendRequestValidation,
    cancelFriendRequestValidation
} = require('../../services/UserValidation');

module.exports = {

    /**
     * @description "This function is for get users friend list."
     * @param req
     * @param res
     */
    friendList: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo = requestParams.page && requestParams.page > 0
                ? parseInt(requestParams.page, 10)
                : 1;

            const offset = (pageNo - 1) * LIMIT;

            let query = {
                status: ACTIVE,
                type: USER_MODEL.TYPE.USER_TYPE
            };

            if (requestParams.search && requestParams.search !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        first_name: {
                            [Op.like]: `%${requestParams.search}%`,
                        },
                    },
                }
            }

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

            let userIDs = userFriendData && userFriendData ? userFriendData.map((friends) => friends.to_id === authUserId ? friends.from_id : friends.to_id) : null;

            query = {
                ...query,
                id: {
                    [Op.in]: userIDs,
                },
            }
            let data = await User.findAndCountAll({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path'],
                where: query,
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
     * @description "This function is for get users not in friend list."
     * @param req
     * @param res
     */
    nonFriendList: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo = requestParams.page && requestParams.page > 0
                ? parseInt(requestParams.page, 10)
                : 1;

            const offset = (pageNo - 1) * LIMIT;

            let query = {
                status: ACTIVE,
                type: USER_MODEL.TYPE.USER_TYPE
            };

            if (requestParams.search && requestParams.search !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        first_name: {
                            [Op.like]: `%${requestParams.search}%`,
                        },
                    },
                }
            }
            let userFriendData = await UserFriend.findAll({
                attributes: ['id', 'from_id', 'to_id'],
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {
                                    from_id: authUserId
                                },
                                {
                                    to_id: authUserId
                                }
                            ]
                        }
                    ],
                    status: {
                        [Op.ne]: USER_FRIENDS_MODEL.STATUS_TYPE.REJECTED
                    }
                },
            });

            let userIDs = userFriendData && userFriendData ? userFriendData.map((friends) => friends.to_id === authUserId ? friends.from_id : friends.to_id) : null;

            query = {
                ...query,
                id: {
                    [Op.notIn]: userIDs,
                },
            }
            let data = await User.findAndCountAll({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path'],
                where: query,
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
     * @description "This function is for get users pending friend list."
     * @param req
     * @param res
     */
    pendingFriendList: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.query;

            const pageNo = requestParams.page && requestParams.page > 0
                ? parseInt(requestParams.page, 10)
                : 1;

            const offset = (pageNo - 1) * LIMIT;

            let query = {
                status: ACTIVE,
                type: USER_MODEL.TYPE.USER_TYPE
            };

            let userFriendQuery = {
                status: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING
            };

            if (requestParams.type === USER_FRIENDS_MODEL.FRIEND_REQ.SENT) {
                userFriendQuery = {
                    ...userFriendQuery,
                    from_id: authUserId
                };
            } else if (requestParams.type === USER_FRIENDS_MODEL.FRIEND_REQ.RECEIVED) {
                userFriendQuery = {
                    ...userFriendQuery,
                    to_id: authUserId
                };
            }

            if (requestParams.search && requestParams.search !== '') {
                query = {
                    ...query,
                    [Op.or]: {
                        first_name: {
                            [Op.like]: `%${requestParams.search}%`,
                        },
                    },
                }
            }
            let userFriendData = await UserFriend.findAll({
                attributes: ['id', 'from_id', 'to_id'],
                where: userFriendQuery,
            });

            let userIDs = userFriendData && userFriendData ? userFriendData.map((friends) => friends.to_id === authUserId ? friends.from_id : friends.to_id) : null;

            query = {
                ...query,
                id: {
                    [Op.in]: userIDs,
                },
            }

            let data = await User.findAndCountAll({
                attributes: ['id', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path'],
                where: query,
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
                return Response.successResponseWithoutData(res, res.locals.__('noPendingRequestFound'));
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
     * @description "This function is used to send friend request."
     * @param req
     * @param res
     */
    sendFriendReuest: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;
            const validate = await addUserFriendValidation(requestParams, res);
            if (validate) {

                let userFriendData = await User.count({
                    where: {
                        id: requestParams.to_id,
                        status: ACTIVE
                    },
                })
                if (!userFriendData) {
                    return Response.successResponseWithoutData(res, res.__('noUserFound'), StatusCodes.OK);
                } else {
                    let alreadyUserFriend = await UserFriend.count({
                        where: {
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        {
                                            from_id: authUserId
                                        },
                                        {
                                            to_id: requestParams.to_id
                                        }
                                    ]
                                },
                                {
                                    [Op.and]: [
                                        {
                                            from_id: requestParams.to_id
                                        },
                                        {
                                            to_id: authUserId
                                        }
                                    ]
                                }
                            ]
                        },
                    });

                    if(alreadyUserFriend){
                        return Response.successResponseWithoutData(res, res.__('cannotSentFriendRequest'), StatusCodes.OK);
                    }
                    const FriendObj = {
                        from_id: authUserId,
                        to_id: requestParams.to_id,
                    };

                    let userFriendInfo = await UserFriend.create(FriendObj);
                    if (userFriendInfo) {
                        return Response.successResponseWithoutData(res, res.__('UserFriendAddedSuccessfully'), StatusCodes.OK);
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
     * @description "This function is for accept or reject users request"
     * @param req
     * @param res
     */
    acceptRejectFriendRequest: async (req, res) => {
        try {
            const requestParams = req.body;
            const { authUserId } = req;
            const validate = await acceptRejectFriendRequestValidation(requestParams, res);
            if (validate) {
                let isFriendRequestExist = await UserFriend.findOne({
                    attributes: ['id'],
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    {
                                        from_id: requestParams.from_id
                                    },
                                    {
                                        to_id: authUserId
                                    }
                                ]
                            }
                        ],
                        status: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING
                    },
                });

                if (isFriendRequestExist) {

                    await UserFriend.update({ status: requestParams.status }, {
                        where: {
                            id: isFriendRequestExist.id,
                            status: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING
                        }
                    });

                    if (requestParams.status === USER_FRIENDS_MODEL.STATUS_TYPE.ACCEPTED) {
                        return Response.successResponseWithoutData(res, res.__('RequestAcceptedSuccessfully'), StatusCodes.OK);
                    } else if (requestParams.status === USER_FRIENDS_MODEL.STATUS_TYPE.REJECTED) {
                        return Response.successResponseWithoutData(res, res.__('RequestRejectedSuccessfully'), StatusCodes.OK);
                    }

                } else {
                    return Response.successResponseWithoutData(res, res.__('RequestNotFound'), StatusCodes.OK);
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
     * @description "This function is for cancel friend request."
     * @param req
     * @param res
     */
    cancelFriendRequest: async (req, res) => {
        try {
            const requestParams = req.body;
            const { authUserId } = req;
            const validate = await cancelFriendRequestValidation(requestParams, res);
            if (validate) {
                let isFriendRequestExist = await UserFriend.findOne({
                    attributes: ['id'],
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    {
                                        to_id: requestParams.to_id
                                    },
                                    {
                                        from_id: authUserId
                                    }
                                ]
                            }
                        ],
                        status: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING
                    },
                });

                if (isFriendRequestExist) {

                    let userFriendUpdated = await UserFriend.destroy({
                        where: {
                            [Op.and]: [
                                {
                                    [Op.or]: [
                                        {
                                            to_id: requestParams.to_id
                                        },
                                        {
                                            from_id: authUserId
                                        }
                                    ]
                                }
                            ],
                            status: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING
                        },
                    });

                    if (userFriendUpdated) {
                        return Response.successResponseWithoutData(res, res.__('RequestCancelledSuccessfully'), StatusCodes.OK);
                    }

                } else {
                    return Response.successResponseWithoutData(res, res.__('RequestNotFound'), StatusCodes.OK);
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
