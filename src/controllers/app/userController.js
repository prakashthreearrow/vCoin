const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const Helper = require('../../services/Helper');
const Web3Helper = require('../../services/Web3Helper');
const {
    userEditValidation
} = require('../../services/UserValidation');
const S3FileUpload = require('../../services/s3FileUpload');
const { ACTIVE, DELETE, USER_MODEL, VIBECOIN_TRANSFER_TYPE } = require('../../services/Constants');
const { User, Address, Web3Account, sequelize } = require('../../models');

module.exports = {

    /**
     * @description "This function is for get detail.."
     * @param req
     * @param res
     */
    userDetail: async (req, res) => {
        try {
            const { authUserId } = req
            let userResult = await User.findOne({
                attributes: ['id', 'stripe_customer_id', 'first_name', 'last_name', 'full_name', 'nick_name', 'profile_photo', 'profile_photo_path', 'phone', 'email', 'email_verified_at', 'vibecoin_balance', 'login_type', 'social_media_id', 'your_job', 'status', 'address_id', 'createdAt', 'updatedAt'],
                where: {
                    id: authUserId,
                    type: USER_MODEL.TYPE.USER_TYPE,
                    status: {
                        [Op.ne]: DELETE,
                    },
                },
                include: [
                    {
                        model: Address,
                        attributes: ['id', 'apt_suite', 'street_address', 'city', 'country', 'latitude', 'longitute'],
                    }
                ]
            });

            let web3Wallet = await Web3Account.findOne({
                attributes: ['id', 'address'],
                where: {
                    reference_id: userResult.id,
                    type: VIBECOIN_TRANSFER_TYPE.USER
                }
            });

            if (web3Wallet) {
                userResult.balance = await Web3Helper.getBalance(web3Wallet.address);
                userResult.qr_code = `${process.env.QR_CODE}${web3Wallet.address}`;
            }

            userResult.address = userResult.Address && userResult.Address !== '' ? userResult.Address : '';

            return Response.successResponseData(
                res,
                userResult,
                StatusCodes.OK,
                res.locals.__('userDetail'),
                null
            );
        } catch (error) {
            return Response.errorResponseData(
                res,
                res.__('internalError'),
                error
            );
        }
    },

    /**
     * @description "This function is used to edit user."
     * @param req
     * @param res
     */
    editUser: async (req, res) => {
        try {
            const requestParams = req.fields;
            const { authUserId } = req

            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = userEditValidation(requestParams, res);

            if (validate) {
                let imageName;
                let isImageExist = false;
                if (req.files.profile_photo && req.files.profile_photo.size > 0) {
                    isImageExist = true;
                    await Helper.imageValidation(req, res, req.files.profile_photo);
                    await Helper.imageSizeValidation(req, res, req.files.profile_photo.size);
                }

                const UserObj = {
                    ...requestParams
                };

                if (isImageExist) {
                    imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.profile_photo.name));
                    UserObj.profile_photo = `${USER_MODEL.PROFILE_PHOTO}/${imageName}`;
                }

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
                    await User.update(UserObj, {
                        where: { id: authUserId }
                    });
                    if (isImageExist) {
                        await S3FileUpload.uploadImageS3(req.files.profile_photo.path, imageName, USER_MODEL.PROFILE_PHOTO, res);
                    }
                    const AddressObj = {
                        ...requestParams,
                        updated_ip: SYSTEM_IP,
                        status: ACTIVE
                    };

                    if (userInfo.address_id) {
                        await Address.update(AddressObj, {
                            where: { id: userInfo.address_id }
                        });

                        return Response.successResponseWithoutData(res, res.__('UserUpdatedSuccessfully'), StatusCodes.OK);

                    } else {
                        let addressInfo = await Address.create(AddressObj);
                        await User.update({ address_id: addressInfo.id }, {
                            where: { id: userInfo.id }
                        });
                        return Response.successResponseWithoutData(res, res.__('UserUpdatedSuccessfully'), StatusCodes.OK);
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
    }
}
