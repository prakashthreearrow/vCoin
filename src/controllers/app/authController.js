const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const moment = require('moment');
const useragent = require('express-useragent');
const { StatusCodes } = require('http-status-codes');
const Response = require('../../services/Response');
const { DELETE, ACTIVE, USER_MODEL, EMAIL_TEMPLATE_TYPE, DEVICE_TYPE, VIBECOIN_TRANSFER_TYPE, INACTIVE } = require('../../services/Constants');
const Helper = require('../../services/Helper');
const Web3Helper = require('../../services/Web3Helper');
const S3FileUpload = require('../../services/s3FileUpload');
const Mailer = require('../../services/Mailer');
const {
    userRegisterValidation,
    verifyEmailValidation,
    resendEmailValidation,
    loginValidation,
    userForgotPasswordValidation,
    userResetPasswordValidation,
    userChangePasswordValidation,
    checkSocialAccoutExistValidation
} = require('../../services/UserValidation');
const { User, Otp, EmailTemplate, sequelize, Web3Account, LoginLog, GasFeeTransfer } = require('../../models');
const { issueUser } = require('../../services/User_jwtToken');
const Stripe = require('../../config/stripe');
const stripeInstance = new Stripe();

module.exports = {

    /**
     * @description "This function is for User-Registration."
     * @param req
     * @param res
     */
    userRegistration: async (req, res) => {
        try {
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const requestParams = req.fields;

            // Below function will validate all the fields which we were passing from the body.
            const validate = await userRegisterValidation(requestParams, res);
            if (validate === true) {
                let image = false;
                if (req.files.profile_photo && req.files.profile_photo.size > 0) {
                    image = true;

                    // Below function will check the image extention that should be like image/jpg, ...
                    var isImageType = await Helper.imageValidation(req, res, req.files.profile_photo);

                    var isImageSize = await Helper.imageSizeValidation(req, res, req.files.profile_photo.size);
                } else {
                    return Response.errorResponseWithoutData(
                        res,
                        res.__('imageIsRequired'),
                        StatusCodes.BAD_REQUEST
                    );
                }

                // Below line of code will set the image name with extention(extension which we had pass in the body) 
                const imageName = image ? await Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.files.profile_photo.name)) : '';

                let checkEmailExist = await User.count({
                    where: {
                        email: requestParams.email,
                        status: {
                            [Op.ne]: DELETE
                        }
                    }
                });

                if ((image === true) && (isImageType === true) && (isImageSize === true)) {
                    if (checkEmailExist !== 0) {
                        return Response.errorResponseWithoutData(
                            res,
                            res.__('EmailAlreadyRegistered'),
                            StatusCodes.EXPECTATION_FAILED,
                        )
                    } else {
                        const UserObj = {
                            type: USER_MODEL.TYPE.USER_TYPE,
                            first_name: requestParams.first_name,
                            last_name: requestParams.last_name,
                            email: requestParams.email,
                            login_type: requestParams.login_type,
                            social_media_id: requestParams.login_type == !USER_MODEL.LOGIN_TYPE.NORMAL ? requestParams.social_media_id : "",
                            fcm_token: requestParams.fcm_token,
                            device_type: requestParams.device_type,
                            created_ip: SYSTEM_IP,
                            status: INACTIVE
                        };
                        if (requestParams.login_type === USER_MODEL.LOGIN_TYPE.NORMAL) {
                            const pass = await bcrypt.hash(requestParams.password, 10);
                            UserObj.password = pass
                        }
                        if (requestParams.login_type === USER_MODEL.LOGIN_TYPE.GOOGLE ||
                            requestParams.login_type === USER_MODEL.LOGIN_TYPE.FACEBOOK ||
                            requestParams.login_type === USER_MODEL.LOGIN_TYPE.APPLE) {
                            UserObj.email_verified_at = moment().toDate();
                        }

                        if (image) {
                            UserObj.profile_photo = `${USER_MODEL.PROFILE_PHOTO}/${imageName}`
                        }


                        let userResult = await User.create(UserObj);

                        // create customer
                        const stripeCustomerData = new Promise((resolve, reject) => {
                            resolve(stripeInstance.createCustomer(`${requestParams.first_name} ${requestParams.last_name}`, requestParams.email))
                        });
                        stripeCustomerData.then((stripeCustomer) => {
                            if (stripeCustomer.id) {
                                User.update({ stripe_customer_id: stripeCustomer.id }, {
                                    where: {
                                        email: stripeCustomer.email, stripe_customer_id: {
                                            [Op.eq]: null
                                        }
                                    }
                                });
                            }
                        });

                        if (userResult) {
                            if (image) {
                                await S3FileUpload.uploadImageS3(req.files.profile_photo.path, imageName, USER_MODEL.PROFILE_PHOTO, res);
                            }

                            var currentDate = new Date();
                            var otpTokenExpire = new Date(currentDate.getTime() + USER_MODEL.EMAIL_VERIFY_OTP_EXPIRY_MINUTE * 60000);

                            // Create Web3 account of user
                            let accountData = await Web3Helper.createAccount(userResult.id, userResult.email);

                            if (typeof (accountData) !== 'undefined') {
                                let Web3AccountObj = {
                                    reference_id: userResult.id,
                                    address: accountData.address,
                                    private_key: accountData.encryptKey,
                                    type: VIBECOIN_TRANSFER_TYPE.USER
                                };
                                let web3Wallet = await Web3Account.create(Web3AccountObj);

                                if (web3Wallet) {
                                    await GasFeeTransfer.create({ address: web3Wallet.address });
                                }
                            }

                            const otp = await Helper.makeRandomDigit(4);

                            if (otp) {
                                await Otp.update({ status: DELETE }, {
                                    where: {
                                        status: ACTIVE,
                                        user_id: userResult.id
                                    }
                                });

                                const OtpObj = {
                                    otp: otp,
                                    otp_expiry: otpTokenExpire,
                                    otp_type: USER_MODEL.OTP_TYPE.OTP_VERIFY,
                                    user_id: userResult.id,
                                    created_ip: SYSTEM_IP,
                                    status: ACTIVE
                                };
                                let otpData = await Otp.create(OtpObj);
                                if (otpData) {

                                    let dynamicValues = {
                                        FIRST_NAME: userResult.first_name,
                                        SITE_NAME: Helper.AppName,
                                        OTP: otp
                                    }
                                    let emailTemplateModel = await EmailTemplate.findOne({
                                        attributes: ['id', 'title', 'subject', 'format'],
                                        where: {
                                            type: EMAIL_TEMPLATE_TYPE.OTP_VERIFY,
                                            status: {
                                                [Op.ne]: DELETE
                                            },
                                        },
                                    });
                                    let emailBody = Helper.emailBody(dynamicValues, emailTemplateModel.format);
                                    const locals = {
                                        username: requestParams.first_name,
                                        appName: Helper.AppName,
                                        otp: otp,
                                        title: emailTemplateModel.title,
                                        format: emailBody
                                    };
                                    Mailer.sendMail(requestParams.email, emailTemplateModel.subject, Helper.emailTemplate, locals);

                                    return Response.successResponseWithoutData(
                                        res,
                                        res.__('UserAddedSuccessfully'),
                                        StatusCodes.OK
                                    );
                                }
                            }
                        }
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
     * @description "This function is for User-Login."
     * @param req
     * @param res
     */
    login: async (req, res) => {
        try {
            const reqParam = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const source = req.headers['user-agent'];

            // Below function will validate all the fields which we are passing in the body.
            const validate = await loginValidation(reqParam, res)
            if (validate === true) {

                let userResult = await User.findOne({
                    attributes: ['id', 'type', 'email', 'password', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path', 'email_verified_at', 'email_verified_block_at', 'status', 'createdAt', 'updatedAt'],
                    where: {
                        email: reqParam.email,
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: {
                            [Op.ne]: DELETE
                        }
                    }
                });
                if (userResult) {

                    let web3Wallet = await Web3Account.findOne({
                        attributes: ['id', 'address'],
                        where: {
                            reference_id: userResult.id,
                            type: VIBECOIN_TRANSFER_TYPE.USER
                        }
                    });
                    if (userResult.email_verified_at !== null && userResult.email_verified_block_at === null) {

                        // Below function compare hash password store in database and from the body we pass.
                        let password = await bcrypt.compare(
                            reqParam.password,
                            userResult.password);

                        if (password) {
                            if (web3Wallet) {
                                userResult.balance = await Web3Helper.getBalance(web3Wallet.address);
                                userResult.qr_code = `${process.env.QR_CODE}${web3Wallet.address}`;
                            }

                            // Below line of code set the expiry time in hours for JWT sign-in 
                            const userExpTime =
                                await Helper.expiryTime(process.env.USER_TOKEN_EXP);

                            const payload = {
                                id: userResult.id,
                                type: userResult.type,
                                exp: userExpTime
                            };

                            // Below function used to generate token which contain ID and exp time we are passing in payload. 
                            const token = issueUser(payload);

                            const userAgent = useragent.parse(source);
                            let loginLogObj = {
                                user_id: userResult.id,
                                device_id: userAgent.os,
                                created_ip: SYSTEM_IP,
                            };

                            if (userAgent.isAndroid) {
                                loginLogObj.device_type = DEVICE_TYPE.ANDROID
                            } else if (userAgent.isiPhone) {
                                loginLogObj.device_type = DEVICE_TYPE.IPHONE
                            } else if (userAgent.isDesktop) {
                                loginLogObj.device_type = DEVICE_TYPE.DESKTOP
                            }

                            let userLoginLog = await LoginLog.create(loginLogObj);

                            if (userLoginLog) {
                                return Response.successLoginResponseData(
                                    res,
                                    userResult,
                                    StatusCodes.OK,
                                    res.locals.__('loginSuccess'),
                                    token
                                );
                            }
                        } else {
                            return Response.errorResponseWithoutData(
                                res,
                                res.locals.__('phonePassNotMatch'),
                                StatusCodes.BAD_REQUEST
                            );
                        }
                    } else {
                        Response.successResponseWithoutData(
                            res,
                            res.locals.__('emailVerify'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    }
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
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
     * @description "This function is for verify mail."
     * @param req
     * @param res
     */
    verifyEmail: async (req, res) => {
        try {

            const reqParam = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // Below function will validate all the fields which we are passing in the body.
            const validate = await verifyEmailValidation(reqParam, res)
            if (validate === true) {
                let userResult = await User.findOne({
                    attributes: ['id', 'first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path', 'email', 'login_type', 'status'],
                    where: {
                        email: reqParam.email,
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: {
                            [Op.ne]: DELETE
                        }
                    }
                });

                if (userResult) {
                    let otpResult = await Otp.findOne({
                        attributes: ['id', 'otp_expiry'],
                        where: {
                            otp: reqParam.otp,
                            user_id: userResult.id,
                            otp_type: USER_MODEL.OTP_TYPE.OTP_VERIFY,
                            status: {
                                [Op.ne]: DELETE
                            }

                        }
                    });

                    if (otpResult) {
                        const currentTime = new Date();
                        const otpExpiry = new Date(otpResult.otp_expiry)

                        if (currentTime.getTime() > otpExpiry.getTime()) {
                            return Response.errorResponseWithoutData(
                                res,
                                res.locals.__('otpExpired'),
                                StatusCodes.EXPECTATION_FAILED,
                            )
                        } else {
                            const currentDateAndTime = moment().toDate();

                            let userUpdate = await User.update({ email_verified_at: currentDateAndTime, updated_ip: SYSTEM_IP, status: ACTIVE }, {
                                where: { email: userResult.email }
                            });
                            if (userUpdate) {
                                let userInfo = await User.findOne({
                                    attributes: ['first_name', 'last_name', 'full_name', 'profile_photo', 'profile_photo_path', 'email', 'login_type', 'status'],
                                    where: {
                                        email: reqParam.email,
                                        type: USER_MODEL.TYPE.USER_TYPE,
                                        status: {
                                            [Op.ne]: DELETE
                                        }
                                    }
                                });

                                return Response.successResponseData(
                                    res,
                                    userInfo,
                                    StatusCodes.OK,
                                    res.__('emailVerified')
                                );
                            }
                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('otpNotExist'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    }
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
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
     * @description "This function is for re-send otp."
     * @param req
     * @param res
     */
    resendOtp: async (req, res) => {
        try {
            const reqParam = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            // Below function will validate all the fields which we are passing in the body.
            const validate = await resendEmailValidation(reqParam, res)
            if (validate === true) {
                let userResult = await User.findOne({
                    attributes: ['id', 'email', 'email_verified_block_at', 'email_verified_attempt', 'first_name', 'last_name'],
                    where: {
                        email: reqParam.email,
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: {
                            [Op.ne]: DELETE
                        }
                    }
                });

                if (userResult) {

                    var currentDate = new Date();
                    var otpTokenExpire = new Date(currentDate.getTime() + USER_MODEL.EMAIL_VERIFY_OTP_EXPIRY_MINUTE * 60000);
                    const otp = await Helper.makeRandomDigit(4);

                    const OtpObj = {
                        otp: otp,
                        otp_expiry: otpTokenExpire,
                        user_id: userResult.id,
                        created_ip: SYSTEM_IP,
                        status: ACTIVE
                    };

                    if (reqParam.type === EMAIL_TEMPLATE_TYPE.OTP_VERIFY) {
                        // below code will send verify otp mail for registration.
                        OtpObj.otp_type = USER_MODEL.OTP_TYPE.OTP_VERIFY
                        Otp.update({ status: DELETE }, {
                            where: {
                                status: ACTIVE,
                                user_id: userResult.id
                            }
                        });
                        let otpData = await Otp.create(OtpObj);
                        if (otpData) {

                            let dynamicValues = {
                                FIRST_NAME: userResult.first_name,
                                SITE_NAME: Helper.AppName,
                                OTP: otp
                            }
                            let emailTemplateModel = await EmailTemplate.findOne({
                                attributes: ['id', 'title', 'subject', 'format'],
                                where: {
                                    type: EMAIL_TEMPLATE_TYPE.OTP_VERIFY,
                                    status: {
                                        [Op.ne]: DELETE
                                    },
                                },
                            });
                            let emailBody = Helper.emailBody(dynamicValues, emailTemplateModel.format);
                            const locals = {
                                username: userResult.first_name,
                                appName: Helper.AppName,
                                otp: otp,
                                title: emailTemplateModel.title,
                                format: emailBody
                            };
                            Mailer.sendMail(userResult.email, emailTemplateModel.subject, Helper.emailTemplate, locals);
                            return Response.successResponseWithoutData(
                                res,
                                res.__('otpVeriftForRegistration'),
                                StatusCodes.OK
                            );
                        }
                    } else if (reqParam.type === EMAIL_TEMPLATE_TYPE.RESEND_OTP) {
                        // below code will send mail for otp to reset password.
                        if (userResult.email_verified_block_at === null) {

                            let userUpdate = await User.update({ email_verified_attempt: userResult.email_verified_attempt + 1, updated_ip: SYSTEM_IP }, {
                                where: { email: userResult.email }
                            });

                            if (userUpdate) {

                                if ((userResult.email_verified_attempt + 1) > USER_MODEL.MAX_USER_VERIFY_ATTEMPT) {

                                    const currentDateAndTime = moment().toDate();

                                    let userDataUpdate = await User.update({ email_verified_block_at: currentDateAndTime, updated_ip: SYSTEM_IP }, {
                                        where: { email: userResult.email }
                                    });

                                    if (userDataUpdate) {
                                        return Response.errorResponseWithoutData(
                                            res,
                                            res.__('accountBlocked'),
                                            StatusCodes.OK
                                        );
                                    }
                                } else {

                                    let dynamicValues = {
                                        FIRST_NAME: userResult.first_name,
                                        SITE_NAME: Helper.AppName,
                                        OTP: otp
                                    }

                                    let emailTemplateModel = await EmailTemplate.findOne({
                                        attributes: ['id', 'title', 'subject', 'format'],
                                        where: {
                                            type: EMAIL_TEMPLATE_TYPE.RESEND_OTP,
                                            status: {
                                                [Op.ne]: DELETE
                                            },
                                        },
                                    });

                                    let emailBody = Helper.emailBody(dynamicValues, emailTemplateModel.format);

                                    const locals = {
                                        appName: Helper.AppName,
                                        title: emailTemplateModel.title,
                                        format: emailBody
                                    };

                                    Mailer.sendMail(reqParam.email, emailTemplateModel.subject, Helper.emailTemplate, locals);

                                    OtpObj.otp_type = USER_MODEL.OTP_TYPE.RESET_PASSWORD_VERIFY

                                    Otp.update({ status: DELETE }, {
                                        where: {
                                            status: ACTIVE,
                                            user_id: userResult.id
                                        }
                                    });
                                    let otpData = await Otp.create(OtpObj);
                                    if (otpData) {

                                        return Response.successResponseWithoutData(
                                            res,
                                            res.__('emailResend'),
                                            StatusCodes.OK
                                        );
                                    }
                                }
                            }
                        } else {
                            return Response.errorResponseWithoutData(
                                res,
                                res.__('accountBlocked'),
                                StatusCodes.OK
                            );
                        }
                    }

                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
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
     * @description user forgot password controller
     * @param req
     * @param res
     */
    forgotPassword: async (req, res) => {
        try {
            const reqParam = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = userForgotPasswordValidation(reqParam, res)
            if (validate === true) {
                let userResult = await User.findOne({
                    attributes: ['id', 'first_name', 'status'],
                    where: {
                        email: reqParam.email.toLowerCase(),
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: {
                            [Op.ne]: DELETE
                        },
                    },
                });
                if (userResult) {
                    if (userResult.status === ACTIVE) {

                        var currentDate = new Date();
                        var restTokenExpire = new Date(currentDate.getTime() + USER_MODEL.EMAIL_VERIFY_OTP_EXPIRY_MINUTE * 60000);
                        const otp = await Helper.makeRandomDigit(USER_MODEL.NUM_OF_DIGIT_OTP);
                        if (otp) {
                            await Otp.update({ status: DELETE }, {
                                where: {
                                    status: ACTIVE,
                                    user_id: userResult.id
                                }
                            });

                            const OtpObj = {
                                otp: otp,
                                otp_expiry: restTokenExpire,
                                otp_type: USER_MODEL.OTP_TYPE.RESET_PASSWORD_VERIFY,
                                user_id: userResult.id,
                                created_ip: SYSTEM_IP,
                                status: ACTIVE
                            };

                            let otpData = await Otp.create(OtpObj);

                            let dynamicValues = {
                                FIRST_NAME: userResult.first_name,
                                SITE_NAME: Helper.AppName,
                                OTP: otp
                            }
                            let emailTemplateModel = await EmailTemplate.findOne({
                                attributes: ['id', 'title', 'subject', 'format'],
                                where: {
                                    type: EMAIL_TEMPLATE_TYPE.FORGET_PASSWORD,
                                    status: {
                                        [Op.ne]: DELETE
                                    },
                                },
                            });

                            let emailBody = Helper.emailBody(dynamicValues, emailTemplateModel.format);
                            if (otpData) {
                                const locals = {
                                    appName: Helper.AppName,
                                    title: emailTemplateModel.title,
                                    format: emailBody
                                };

                                Mailer.sendMail(reqParam.email, emailTemplateModel.subject, Helper.emailTemplate, locals);

                                return Response.successResponseWithoutData(
                                    res,
                                    res.locals.__('forgotPasswordEmailSendSuccess'),
                                    StatusCodes.OK,
                                );

                            }
                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('accountIsInactive'),
                            StatusCodes.UNAUTHORIZED
                        );
                    }
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('emailNotExist'),
                        StatusCodes.EXPECTATION_FAILED
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
     * @description user reset password controller
     * @param req
     * @param res
     */
    resetPassword: async (req, res) => {
        try {
            const requestParams = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = userResetPasswordValidation(requestParams, res);
            if (validate === true) {
                const { email } = requestParams;
                const { otp } = requestParams;
                const { password } = requestParams;

                let newPassword = await bcrypt.hash(password, 10)

                if (newPassword) {
                    let userResult = await User.findOne({
                        attributes: ['id'],
                        where: {
                            email: email,
                            type: USER_MODEL.TYPE.USER_TYPE,
                            status: {
                                [Op.ne]: DELETE,
                            },
                        },
                    });

                    if (userResult) {

                        let otpResult = await Otp.findOne({
                            attributes: ['id', 'otp_expiry', 'createdAt'],
                            where: {
                                otp: otp,
                                user_id: userResult.id,
                                otp_type: USER_MODEL.OTP_TYPE.RESET_PASSWORD_VERIFY,
                                status: {
                                    [Op.ne]: DELETE,
                                },
                            }
                        });

                        if (otpResult) {
                            const currentTime = new Date();
                            const otpExpiry = new Date(otpResult.otp_expiry)

                            if (currentTime.getTime() > otpExpiry.getTime()) {
                                return Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__('otpExpired'),
                                    StatusCodes.EXPECTATION_FAILED,
                                );
                            } else {

                                let userUpdate = await User.update({ password: newPassword, updated_ip: SYSTEM_IP, email_verified_block_at: null, email_verified_attempt: 0 }, {
                                    where: { email: email }
                                });

                                if (userUpdate) {

                                    await Otp.update({ status: DELETE, updated_ip: SYSTEM_IP }, {
                                        where: {
                                            otp: otp,
                                            user_id: userResult.id,
                                        }
                                    });

                                    Response.successResponseWithoutData(
                                        res,
                                        res.__('passwordResetSuccessfully')
                                    );

                                } else {
                                    Response.errorResponseWithoutData(
                                        res,
                                        res.__('resetPasswordFailed'),
                                        StatusCodes.EXPECTATION_FAILED
                                    );
                                }
                            }

                        } else {
                            Response.errorResponseWithoutData(
                                res,
                                res.locals.__('otpNotExist'),
                                StatusCodes.EXPECTATION_FAILED,
                            );
                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.locals.__('userNotExist'),
                            StatusCodes.EXPECTATION_FAILED
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
     * @description user change password
     * @param req
     * @param res
     */
    changePassword: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const validate = userChangePasswordValidation(requestParams, res)
            if (validate === true) {
                let userResult = await User.findOne({
                    attributes: ['id', 'password'],
                    where: {
                        id: authUserId,
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: {
                            [Op.ne]: DELETE
                        },
                    },
                });

                if (userResult) {
                    let oldPasswordRes = await bcrypt.compare(
                        requestParams.old_password,
                        userResult.password);

                    if (oldPasswordRes) {
                        let newPasswordRes = await bcrypt.compare(
                            requestParams.password,
                            userResult.password
                        );

                        if (newPasswordRes) {
                            Response.errorResponseWithoutData(
                                res,
                                res.__('oldNewPasswordSame'),
                                StatusCodes.EXPECTATION_FAILED,
                            );
                        } else {
                            let userPassword = await bcrypt.hash(
                                requestParams.password,
                                10);

                            let userUpdate = await User.update(
                                {
                                    password: userPassword,
                                    updated_ip: SYSTEM_IP
                                },
                                {
                                    where: {
                                        id: userResult.id,
                                    }
                                }
                            );

                            if (userUpdate) {
                                Response.successResponseWithoutData(
                                    res,
                                    res.__('changePasswordSuccess'),
                                    StatusCodes.OK,
                                );
                            }

                        }
                    } else {
                        Response.errorResponseWithoutData(
                            res,
                            res.__('oldPasswordNotMatch'),
                            StatusCodes.EXPECTATION_FAILED,
                        );
                    }
                } else {
                    return Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
                        StatusCodes.OK,
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
     * @description "This function is to check social account exist or not."
     * @param req
     * @param res
     */
    checkSocialAccoutExist: async (req, res) => {
        try {
            const reqParam = req.body;
            // Below function will validate all the fields which we are passing in the body.
            const validate = await checkSocialAccoutExistValidation(reqParam, res)
            if (validate === true) {
                let userResult = await User.count({
                    where: {
                        email: reqParam.email,
                        type: USER_MODEL.TYPE.USER_TYPE,
                        status: ACTIVE,
                        login_type: {
                            [Op.in]: [USER_MODEL.LOGIN_TYPE.GOOGLE, USER_MODEL.LOGIN_TYPE.FACEBOOK, USER_MODEL.LOGIN_TYPE.APPLE],
                        }
                    }
                });

                if (userResult) {
                    Response.successResponseWithoutData(
                        res,
                        res.__('socialAccoutExist'),
                        StatusCodes.OK,
                    );
                } else {
                    Response.errorResponseWithoutData(
                        res,
                        res.locals.__('userNotExist'),
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
     * @description "This function is to create stripe account."
     * @param req
     * @param res
     */
    createStripeAccount: async (req, res) => {
        try {
            const { authUserId } = req
            let userResult = await User.findOne({
                attributes: ['id', 'stripe_customer_id', 'first_name', 'last_name', 'email'],
                where: {
                    id: authUserId,
                    type: USER_MODEL.TYPE.USER_TYPE,
                    status: ACTIVE
                }
            });

            if (userResult.stripe_customer_id !== null) {
                return Response.successResponseData(res, userResult.stripe_customer_id, StatusCodes.OK, res.__('success'));
            } else {
                // create customer
                const stripeCustomerData = await stripeInstance.createCustomer(`${userResult.first_name} ${userResult.last_name}`, userResult.email);

                if (stripeCustomerData.id) {
                    User.update({ stripe_customer_id: stripeCustomerData.id }, {
                        where: {
                            email: stripeCustomerData.email, stripe_customer_id: {
                                [Op.eq]: null
                            }
                        }
                    });
                    return Response.successResponseData(res, stripeCustomerData.id, res.__('stripeIDCreatedSuccessfully'), StatusCodes.OK);
                } else {
                    return Response.errorResponseWithoutData(
                        res,
                        res.__('stipeIDNotFound'),
                        StatusCodes.INTERNAL_SERVER_ERROR
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
}
