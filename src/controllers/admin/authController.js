const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const fs = require('fs');
const useragent = require('express-useragent');
const moment = require('moment');
const { StatusCodes } = require('http-status-codes');
const S3FileUpload = require('../../services/s3FileUpload');
const Response = require('../../services/Response');
const { DELETE, ACTIVE, USER_MODEL, EMAIL_TEMPLATE_TYPE, IMAGE_STORAGE_PATH, DEVICE_TYPE, VIBECOIN } = require('../../services/Constants');
const Helper = require('../../services/Helper');
const Mailer = require('../../services/Mailer');
const {
  adminLoginValidation,
  adminForgotPasswordValidation,
  adminResetPasswordValidation,
  adminChangePasswordValidation,
  adminResendOtpValidation,
  adminEditValidation
} = require('../../services/AdminValidation');
const { issueAdmin } = require('../../services/Admin_jwtToken');
const { User, Otp, EmailTemplate, sequelize, LoginLog } = require('../../models');


module.exports = {

  /**
   * @description admin login GET
   * @param req
   * @param res
   */
  index: (req, res) => {
    let message = '';
    res.render('auth/login', { layout: false, message: message, messages: req.flash('successMessage') });
  },

  /**
  * @description admin forgotPassword GET
  * @param req
  * @param res
  */
  getForgotPassword: (req, res) => {
    let message = '';
    res.render('auth/forgot_password', { layout: false, message: message, messages: req.flash('successMessage') });
  },

  /**
   * @description admin resetPassword GET
   * @param req
   * @param res
   */
  getResetPassword: (req, res) => {
    let message = '';
    let uuid = req.params.token;
    res.render('auth/reset_password', { layout: false, token: uuid, message: message, messages: req.flash('successMessage') });
  },

  /**
  * @description admin logout GET
  * @param req
  * @param res
  */
  logout: (req, res) => {
    req.session.destroy(function (err) {
      res.redirect("/admin/login");

    })
  },

  /**
  * @description admin dashboard GET
  * @param req
  * @param res
  */
  dashboard: (req, res) => {
    res.render('home/dashboard', { message: req.flash('errorMessage'), messages: req.flash('successMessage') });
  },

  /**
   * @description admin login controller
   * @param req
   * @param res
   */
  login: async (req, res) => {
    try {
      let isVibeCoinMint = false;
      let reqParam = {};
      if (req.session.user !== undefined) {
        isVibeCoinMint = true;
        reqParam.email = req.session.user.email,
          reqParam.password = req.body.password

      } else {
        reqParam = req.body
      }

      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const source = req.headers['user-agent'];
      const validate = adminLoginValidation(reqParam, res);
      if (validate.status === true) {

        let adminResult = await User.findOne({
          attributes: ['id', 'type', 'email', 'password', 'first_name', 'last_name', 'full_name', 'profile_photo', 'status'],
          where: {
            email: reqParam.email,
            type: USER_MODEL.TYPE.ADMIN_TYPE,
            status: {
              [Op.ne]: DELETE
            },
          },
        });

        if (adminResult) {
          if (adminResult.status === ACTIVE) {
            let passwordMatch = await bcrypt.compare(
              reqParam.password,
              adminResult.password);
            if (passwordMatch) {
              const superAdminExpTime =
                await Helper.expiryTime(process.env.SUPER_ADMIN_TOKEN_EXP);
              const payload = {
                id: adminResult.id,
                type: adminResult.type,
                exp: superAdminExpTime
              };

              const token = issueAdmin(payload);

              req.session.token = token;
              req.session.user = {
                id: adminResult.id,
                first_name: adminResult.first_name,
                last_name: adminResult.last_name,
                full_name: adminResult.full_name,
                email: adminResult.email,
                profilePhoto: await S3FileUpload.mediaUrlForS3(
                  adminResult.profile_photo
                )
              };

              const userAgent = useragent.parse(source);
              let loginLogObj = {
                user_id: adminResult.id,
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
                req.flash('successMessage', res.locals.__('loginSuccess'));
              }

              if (isVibeCoinMint) {
                if (req.body.mint === VIBECOIN.MINT) {
                  res.redirect('/admin/mint');
                } else if (req.body.minter_role === VIBECOIN.MINT_ROLE) {
                  res.redirect('/admin/minter-role');
                }
              } else {
                res.redirect('/admin/dashboard');
              }
            } else {
              if (req.body.mint === VIBECOIN.MINT) {
                req.flash('errorMessage', res.locals.__('phonePassNotMatch'));
                res.redirect('/admin/mint-password');
              } else if (req.body.minter_role === VIBECOIN.MINT_ROLE) {
                req.flash('errorMessage', res.locals.__('phonePassNotMatch'));
                res.redirect('/admin/minter-role-password');
              } else {
                res.render('auth/login', { layout: false, message: res.locals.__('phonePassNotMatch') });
              }
            }
          } else {
            req.session.destroy();
            res.render('auth/login', { layout: false, message: res.locals.__('accountIsInactive') });
            return;
          }
        } else {
          req.session.destroy();
          res.render('auth/login', { layout: false, message: res.locals.__('emailNotExist') });
          return;
        }
      }
    } catch (error) {
      req.session.destroy();
      res.render('auth/login', { layout: false, message: res.locals.__('internalError') });
      return;
    }
  },

  /**
   * @description admin forgot password controller
   * @param req
   * @param res
   */
  forgotPassword: async (req, res) => {
    try {
      const reqParam = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const validate = adminForgotPasswordValidation(reqParam, res);
      if (!validate.status) {
        res.render('auth/forgot_password', { layout: false, message: validate.message });
      }
      if (validate.status === true) {

        let adminResult = await User.findOne({
          attributes: ['id', 'uuid', 'first_name', 'last_name', 'full_name', 'status'],
          where: {
            email: reqParam.email.toLowerCase(),
            type: USER_MODEL.TYPE.ADMIN_TYPE,
            status: {
              [Op.ne]: DELETE
            },
          },
        });

        if (adminResult) {
          if (adminResult.status === ACTIVE) {

            var currentDate = new Date();
            var restTokenExpire = new Date(currentDate.getTime() + USER_MODEL.OTP_EXPIRY_IN_MINUTE * 60000);
            const otp = await Helper.makeRandomDigit(USER_MODEL.NUM_OF_DIGIT_OTP);
            if (otp) {

              await Otp.update({ status: DELETE }, {
                where: {
                  status: ACTIVE,
                  user_id: adminResult.id
                }
              });

              const OtpObj = {
                otp: otp,
                otp_expiry: restTokenExpire,
                otp_type: USER_MODEL.OTP_TYPE.RESET_PASSWORD_VERIFY,
                user_id: adminResult.id,
                created_ip: SYSTEM_IP,
                status: ACTIVE
              };

              let otpResult = await Otp.create(OtpObj);
              if (otpResult) {

                let dynamicValues = {
                  FIRST_NAME: adminResult.first_name,
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

                const locals = {
                  username: adminResult.full_name,
                  appName: Helper.AppName,
                  otp: otp,
                  title: emailTemplateModel.title,
                  format: emailBody
                };

                Mailer.sendMail(reqParam.email, emailTemplateModel.subject, Helper.emailTemplate, locals);

                req.flash('successMessage', res.locals.__('forgotPasswordEmailSendSuccess'))
                res.redirect("/admin/reset_password/" + adminResult.uuid)
              }
            }
          } else {
            res.render('auth/forgot_password', { layout: false, message: res.locals.__('accountIsInactive') });
            return
          }
        } else {
          res.render('auth/forgot_password', { layout: false, message: res.locals.__('emailNotExist') });
          return
        }
      }
    } catch (error) {
      res.render('auth/forgot_password', { layout: false, message: res.locals.__('internalError') });
      return
    }
  },

  /**
   * @description admin reset password controller
   * @param req
   * @param res
   */
  resetPassword: async (req, res) => {
    try {
      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const validate = adminResetPasswordValidation(requestParams, res);
      if (!validate.status) {
        res.render('auth/reset_password', { layout: false, token: requestParams.token, message: validate.message });
      }
      if (validate.status === true) {
        const { token } = requestParams;
        const { otp } = requestParams;
        const { password } = requestParams;

        let newPassword = await bcrypt.hash(password, 10)

        let adminResult = await User.findOne({
          attributes: ['id'],
          where: {
            uuid: token,
            type: USER_MODEL.TYPE.ADMIN_TYPE,
            status: {
              [Op.ne]: DELETE,
            },
          },
        });

        if (adminResult) {
          let otpResult = await Otp.findOne({
            attributes: ['id', 'otp_expiry'],
            where: {
              otp: otp,
              user_id: adminResult.id,
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
              req.session.destroy();
              res.render('auth/login', { layout: false, message: res.locals.__('otpExpired') });
              return
            } else {

              let adminUpdate = await User.update({ password: newPassword, updated_ip: SYSTEM_IP }, {
                where: { uuid: token }
              });

              if (adminUpdate) {
                let otpUpdate = await Otp.update({ status: DELETE, updated_ip: SYSTEM_IP }, {
                  where: { otp: otp }
                });
                if (otpUpdate) {
                  req.session.destroy();
                  req.flash('successMessage', res.locals.__('PasswordResetSuccessfully'))
                  res.redirect("/admin/login");
                }
              }
            }
          } else {
            res.render('auth/reset_password', { layout: false, token, message: res.locals.__('otpNotExist') });
            return
          }
        } else {
          res.render('auth/reset_password', { layout: false, token, message: res.locals.__('emailNotExist') });
          return
        }
      }
    } catch (error) {
      res.render('auth/forgot_password', { layout: false, message: res.locals.__('adminNotExist') });
      return
    }
  },

  /**
 * @description admin change password GET
 * @param req
 * @param res
 */
  getChangePassword: (req, res) => {
    let message = '';
    res.render('auth/change_password', { message: message, messages: req.flash('successMessage') });
  },

  /**
   * @description admin change password
   * @param req
   * @param res
   */
  changePassword: async (req, res) => {
    try {
      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const validate = adminChangePasswordValidation(requestParams, res)
      if (!validate.status) {
        res.render('auth/change_password', { message: validate.message });
      }
      if (validate.status === true) {
        let adminResult = await User.findOne({
          attributes: ['id', 'password'],
          where: {
            id: req.session.user.id,
            type: USER_MODEL.TYPE.ADMIN_TYPE,
            status: {
              [Op.ne]: DELETE
            },
          },
        });

        if (adminResult) {
          let oldPasswordRes = await bcrypt.compare(
            requestParams.old_password,
            adminResult.password);

          if (oldPasswordRes) {
            let newPasswordRes = await bcrypt.compare(
              requestParams.password,
              adminResult.password);

            if (newPasswordRes) {
              res.render('auth/change_password', { message: res.locals.__('oldNewPasswordSame') });
              return

            } else {
              let adminPassword = await bcrypt.hash(
                requestParams.password, 10)
              if (adminPassword) {
                let adminUpdate = await User.update(
                  {
                    password: adminPassword,
                    updated_ip: SYSTEM_IP
                  },
                  {
                    where: {
                      id: adminResult.id,
                    }
                  }
                );
                if (adminUpdate) {
                  req.flash('successMessage', res.locals.__('changePasswordSuccess'))
                  res.redirect("/admin/dashboard");

                }
              }
            }
          } else {
            res.render('auth/change_password', { message: res.locals.__('oldPasswordNotMatch') });
            return

          }
        } else {
          res.render('auth/change_password', { message: res.locals.__('emailNotExist') });
          return
        }
      }
    } catch (error) {
      res.render('auth/change_password', { message: res.locals.__('internalError') });
      return
    }
  },

  /**
    * @description admin resend OTP
    * @param req
    * @param res
    */
  resendOtp: async (req, res) => {
    try {
      const reqParam = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // Below function will validate all the fields which we are passing in the body.
      const validate = adminResendOtpValidation(reqParam, res);

      if (!validate.status === false) return Response.validationErrorResponseData(res, validate.message, StatusCodes.OK);

      if (validate.status === true) {

        let adminResult = await User.findOne({
          attributes: ['id', 'email', 'email_verified_block_at', 'email_verified_attempt', 'first_name', 'last_name'],
          where: {
            uuid: reqParam.token,
            type: USER_MODEL.TYPE.ADMIN_TYPE,
            status: {
              [Op.ne]: DELETE
            }
          },
        });

        if (adminResult) {
          // below line condition will check the user was blocked or not.
          if (adminResult.email_verified_block_at === null) {

            // below line condition check, if user exceed for than 5 time attempt sending otp then the user will be blocked for 2 hours.
            if (adminResult.email_verified_attempt >= USER_MODEL.MAX_USER_VERIFY_ATTEMPT) {
              const currentDateAndTime = moment().toDate();

              let adminInfoUpdate = await User.update({ email_verified_block_at: currentDateAndTime, updated_ip: SYSTEM_IP }, {
                where: { email: adminResult.email }
              });
              if (adminInfoUpdate) {
                return Response.errorResponseData(
                  res,
                  res.__('accountBlocked'),
                  StatusCodes.BAD_REQUEST
                );
              }
            } else {
              User.update({ email_verified_attempt: adminResult.email_verified_attempt + 1, updated_ip: SYSTEM_IP }, {
                where: { email: adminResult.email }
              });
              const otp = await Helper.makeRandomDigit(4);
              let dynamicValues = {
                FIRST_NAME: `${adminResult.first_name} ${adminResult.last_name}`,
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
              let emailBody = await Helper.emailBody(dynamicValues, emailTemplateModel.format);
              const locals = {
                appName: Helper.AppName,
                title: emailTemplateModel.title,
                format: emailBody
              };

              Mailer.sendMail(adminResult.email, emailTemplateModel.subject, Helper.emailTemplate, locals);

              await Otp.update({ status: DELETE }, {
                where: {
                  user_id: adminResult.id,
                  status: ACTIVE
                }
              });

              var currentDate = new Date();
              var otpTokenExpire = new Date(currentDate.getTime() + USER_MODEL.EMAIL_VERIFY_OTP_EXPIRY_MINUTE * 60000);
              const OtpObj = {
                otp: otp,
                otp_expiry: otpTokenExpire,
                otp_type: USER_MODEL.OTP_TYPE.NORMAL,
                user_id: adminResult.id,
                created_ip: SYSTEM_IP,
                status: ACTIVE
              };
              let otpData = await Otp.create(OtpObj);
              if (otpData) {
                res.render('auth/reset_password', { layout: false, message: res.locals.__('emailResend') });
                return
              }

            }
          } else {
            return Response.errorResponseData(
              res,
              res.__('accountBlocked'),
              StatusCodes.BAD_REQUEST
            );
          }
        } else {
          return Response.errorResponseData(
            res,
            res.__('emailNotExist'),
            StatusCodes.BAD_REQUEST
          );
        }
      }
    } catch (error) {
      return Response.errorResponseData(
        res,
        res.__('internalError'),
        StatusCodes.INTERNAL_SERVER_ERROR
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
      var userInfo = req.session.user;

      // Below function used to generate image url 
      userInfo.profile_photo = await S3FileUpload.mediaUrlForS3(
        userInfo.profile_photo
      );
      res.render('auth/profile', { userInfo: userInfo, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
    }
  },

  /**
     * @description "This function is used to change profile."
     * @param req
     * @param res
     */
  changeProfile: async (req, res) => {
    try {
      const requestParams = req;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      let image = false;
      if (requestParams && requestParams.file.size > 0) {
        image = true;
        await Helper.imageValidation(req, res, requestParams.file);
        await Helper.imageSizeValidation(req, res, requestParams.file.size);
      }
      const imageName = image ? Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(requestParams.file.originalname)) : '';
      const UserObj = {};
      UserObj.profile_photo = `${USER_MODEL.PROFILE_PHOTO}/${imageName}`;
      UserObj.updated_ip = SYSTEM_IP;

      if (requestParams.body.id) {
        let userResult = await User.findOne({
          attributes: ['id'],
          where: {
            id: requestParams.body.id,
            status: {
              [Op.ne]: DELETE
            }
          }
        });

        if (userResult) {
          let userUpdate = await User.update(UserObj, {
            where: { id: requestParams.body.id }
          });
          if (userUpdate) {
            if (image) {
              // Below function will create and save the images in the s3 bucket
              await S3FileUpload.uploadImageS3(requestParams.file.path, imageName, USER_MODEL.PROFILE_PHOTO, res);
              fs.unlink(`${IMAGE_STORAGE_PATH}/${requestParams.file.filename}`);
            }

            const userProfilePhoto = await S3FileUpload.mediaUrlForS3(
              `${USER_MODEL.PROFILE_PHOTO}/${imageName}`
            );

            req.session.user.profilePhoto = userProfilePhoto;

            return Response.successResponseData(res, res.__('UserUpdatedSuccessfully'), StatusCodes.OK);
          }
        } else {
          return Response.errorResponseData(res, res.__('userNotExist'), StatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
    } catch (error) {
      return Response.errorResponseData(res, res.__('internalError'), StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
     * @description "This function is used to update user."
     * @param req
     * @param res
     */
  updateUser: async (req, res) => {
    try {
      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // Below function will validate all the fields which we were passing from the body.
      const validate = adminEditValidation(requestParams, res);

      if (!validate.status) {
        req.flash('errorMessage', validate.message);
        res.redirect('/admin/dashboard');
      }
      if (validate.status === true) {

        const UserObj = {
          first_name: requestParams.first_name,
          last_name: requestParams.last_name,
          updated_ip: SYSTEM_IP
        };
        if (requestParams.id) {
          let userResult = await User.count({
            where: {
              id: requestParams.id,
              status: {
                [Op.ne]: DELETE
              }
            }
          });

          if (userResult) {
            let userUpdate = await User.update(UserObj, {
              where: { id: requestParams.id },
            });
            if (userUpdate) {
              req.session.user.full_name = `${requestParams.first_name} ${requestParams.last_name}`;
              req.session.user.first_name = requestParams.first_name;
              req.session.user.last_name = requestParams.last_name;

              req.flash('successMessage', res.locals.__('UserUpdatedSuccessfully'))
              res.redirect("/admin/dashboard");
            }
          } else {
            req.flash('errorMessage', res.locals.__('userNotExist'))
            res.redirect("/admin/dashboard");
          }
        }
      }
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'))
      res.redirect("/admin/dashboard");
    }
  },
}
