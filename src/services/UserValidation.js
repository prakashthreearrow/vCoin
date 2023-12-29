const Response = require('./Response');
const Joi = require('@hapi/joi');
const Helper = require('./Helper');
const { DEVICE_TYPE_USER, USER_MODEL, PROMOTION_MODEL, USER_FRIENDS_MODEL, VIBECOIN_TRANSFER_TYPE, EMAIL_TEMPLATE_TYPE } = require('../services/Constants');

module.exports = {

  /**
   * @description "This function is used to validate all the field of user registration api."
   * @param req
   * @param res
   */
  userRegisterValidation: (req, res) => {
    let additionalObj = {}
    const commonObj = {
      first_name: Joi.string().trim().max(50).required(),
      last_name: Joi.string().trim().max(50).required(),
      profile_photo: Joi.string().allow('').trim(),
      email: Joi.string().email().trim().max(100).required(),
      login_type: Joi.string().valid(USER_MODEL.LOGIN_TYPE.NORMAL, USER_MODEL.LOGIN_TYPE.GOOGLE, USER_MODEL.LOGIN_TYPE.FACEBOOK, USER_MODEL.LOGIN_TYPE.APPLE).required(),
      fcm_token: Joi.string().trim().max(350).required(),
      device_type: Joi.string().valid(DEVICE_TYPE_USER.ANDROID, DEVICE_TYPE_USER.IPHONE).required(),
    }

    if (req.login_type === USER_MODEL.LOGIN_TYPE.NORMAL) {
      additionalObj = {
        ...commonObj,
        password: Joi.string().trim().min(6).required().regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
        social_media_id: Joi.string().trim().max(100).optional(),
      }
    }
    if (req.login_type === USER_MODEL.LOGIN_TYPE.GOOGLE ||
      req.login_type === USER_MODEL.LOGIN_TYPE.FACEBOOK ||
      req.login_type === USER_MODEL.LOGIN_TYPE.APPLE) {
      additionalObj = {
        ...commonObj,
        password: Joi.string().trim().min(6).optional().regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
        social_media_id: Joi.string().trim().max(100).required(),

      }
    }

    const schema = Joi.object(additionalObj)
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('userRegisterValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user login api."
   * @param req
   * @param res
   */
  loginValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('loginPasswordValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user forget password as per the required condition using JOI."
   * @param req
   * @param res
   */
  userForgotPasswordValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('userForgotPasswordValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user reset password as per the required condition using JOI."
   * @param req
   * @param res
   */
  userResetPasswordValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required(),
      otp: Joi.string().trim().max(4).required(),
      password: Joi.string()
        .trim()
        .min(6)
        .required()
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
    });
    const { error } = schema.validate(req)
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('resetPasswordValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user change password as per the required condition using JOI."
   * @param req
   * @param res
   */
  userChangePasswordValidation: (req, res) => {
    const schema = Joi.object().keys({
      old_password: Joi.string().trim().required(),
      password: Joi.string()
        .trim()
        .min(6)
        .required()
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('userChangePasswordValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of verification email api."
   * @param req
   * @param res
   */
  verifyEmailValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().required(),
      otp: Joi.number().required(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('verifyEmailValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of resend email api."
   * @param req
   * @param res
   */
  resendEmailValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().required(),
      type: Joi.string().valid(EMAIL_TEMPLATE_TYPE.OTP_VERIFY, EMAIL_TEMPLATE_TYPE.RESEND_OTP).required(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('resendEmailValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of Business api."
   * @param req
   * @param res
   */
  addBusinessValidation: (req, res) => {
    const schema = Joi.object({
      name: Joi.string().trim().max(100).required(),
      photo: Joi.string().allow('').trim(),
      description: Joi.string().allow('').trim().optional(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addBusinessValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of Business api."
   * @param req
   * @param res
   */
  editBusinessValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().trim().max(100).required(),
      photo: Joi.string().allow('').trim(),
      description: Joi.string().trim().optional(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('editBusinessValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of store api."
   * @param req
   * @param res
   */
  addEditStoreValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.number().optional(),
      apt_suite: Joi.string().trim().required(),
      street_address: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
      latitude: Joi.number().required(),
      longitute: Joi.number().required(),
      business_id: Joi.number().required(),
      admin_email: Joi.string().email().trim().max(100).required(),
      name: Joi.string().required(),
      description: Joi.string().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addEditStoreValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of follow api."
   * @param req
   * @param res
   */
  followUnfollowStoreValidation: (req, res) => {
    const schema = Joi.object({
      business_id: Joi.number().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('followUnfollowStoreValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of promotion api."
   * @param req
   * @param res
   */
  promotionAddEditValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().optional(),
      loyalty_card_id: Joi.string().required(),
      type: Joi.string().valid(PROMOTION_MODEL.TYPE.DISCOUNT, PROMOTION_MODEL.TYPE.PROMOTION, PROMOTION_MODEL.TYPE.PAID_REFERRALS, PROMOTION_MODEL.TYPE.CASH_BACK).required(),
      customer_amount: Joi.string().required(),
      customer_referral_amount: Joi.string().allow('').optional(),
      start_date: Joi.date().iso().required(),
      end_date: Joi.date().iso().required(),
      description: Joi.string().optional(),
      qr_code: Joi.string().allow('').trim()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('promotionAddEditValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of loyalty card add api."
   * @param req
   * @param res
   */
  addLoyaltyCardValidation: (req, res) => {
    const schema = Joi.object({
      store_id: Joi.string().trim().required(),
      name: Joi.string().trim().required(),
      description: Joi.string().trim().optional()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addLoyaltyCardValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of loyalty card edit api."
   * @param req
   * @param res
   */
  editLoyaltyCardValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().trim().required(),
      name: Joi.string().trim().required(),
      description: Joi.string().trim().optional(),
      delete_photo: Joi.string().allow('').optional(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('editLoyaltyCardValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of upvotes api."
   * @param req
   * @param res
   */
  upvotesValidation: (req, res) => {
    const schema = Joi.object({
      promotion_id: Joi.number().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('upvotesValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user registration api."
   * @param req
   * @param res
   */
  userAddEditValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().optional(),
      first_name: Joi.string().trim().max(50).required(),
      last_name: Joi.string().trim().max(50).required(),
      profile_photo: Joi.string().allow('').trim(),
      email: Joi.string().email().trim().max(100).required(),
      phone: Joi.string().trim().min(5).max(15).optional(),
      password: Joi.string().trim().min(6).required().regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
      login_type: Joi.string().valid(USER_MODEL.LOGIN_TYPE.NORMAL, USER_MODEL.LOGIN_TYPE.GOOGLE, USER_MODEL.LOGIN_TYPE.FACEBOOK, USER_MODEL.LOGIN_TYPE.APPLE)
        .required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('userAddEditValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of user edit api."
   * @param req
   * @param res
   */
  userEditValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().optional(),
      apt_suite: Joi.string().trim().optional(),
      street_address: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
      latitude: Joi.number().optional(),
      longitute: Joi.number().optional(),
      nick_name: Joi.string().trim().max(50).optional(),
      first_name: Joi.string().trim().max(50).optional(),
      last_name: Joi.string().trim().max(50).optional(),
      phone: Joi.string().trim().max(50).optional(),
      profile_photo: Joi.string().allow('').trim(),
      your_job: Joi.string().trim().max(50).optional(),
    })
    const { error } = schema.validate(req);
    if (error) {
      Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('userEditValidation', error))
      );
    } else {
      return true;
    }
  },

  /**
   * @description "This function is used to validate all the field of add card api."
   * @param req
   * @param res
   */
  createCardValidation: (req, res) => {

    const schema = Joi.object({
      customer_id: Joi.string().trim().max(100).required(),
      number: Joi.number().required(),
      exp_month: Joi.number().required(),
      exp_year: Joi.number().required(),
      cvc: Joi.number().required(),
    });

    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of remove card api."
   * @param req
   * @param res
   */
  removeCardValidation: (req, res) => {
    const schema = Joi.object({
      customer_id: Joi.string().trim().max(100).required(),
      card_id: Joi.string().trim().max(100).required()
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of get card api."
   * @param req
   * @param res
   */
  getAllCardValidation: (req, res) => {
    const schema = Joi.object({
      customer_id: Joi.string().trim().max(100).required()
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of default card api."
   * @param req
   * @param res
   */
  defaultCardValidation: (req, res) => {
    const schema = Joi.object({
      customer_id: Joi.string().trim().max(100).required(),
      card_id: Joi.string().trim().max(100).required()
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate the field of user social account exist api."
   * @param req
   * @param res
   */
  checkSocialAccoutExistValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('checkSocialAccoutExistValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate the field of user send friends api."
   * @param req
   * @param res
   */
  addUserFriendValidation: (req, res) => {
    const schema = Joi.object({
      to_id: Joi.number().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('addUserFriendValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate the field of user accept or reject friends api."
   * @param req
   * @param res
   */
  acceptRejectFriendRequestValidation: (req, res) => {
    const schema = Joi.object({
      from_id: Joi.number().required(),
      status: Joi.number().valid(USER_FRIENDS_MODEL.STATUS_TYPE.ACCEPTED, USER_FRIENDS_MODEL.STATUS_TYPE.REJECTED)
        .required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('acceptRejectFriendRequestValidation', error))
      );
    }
    return true;
  },

/**
   * @description "This function is used to validate the field of user cancel friend friends api."
   * @param req
   * @param res
   */
 cancelFriendRequestValidation: (req, res) => {
  const schema = Joi.object({
    to_id: Joi.number().required(),
  })
  const { error } = schema.validate(req);
  if (error) {
    return Response.validationErrorResponseData(
      res,
      res.__(Helper.validationMessageKey('cancelFriendRequestValidation', error))
    );
  }
  return true;
},

  /**
   * @description "This function is used to validate all the field of promotion link api."
   * @param req
   * @param res
   */
  promotionLinkValidation: (req, res) => {
    const schema = Joi.object({
      promotion_id: Joi.string().required(),
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('promotionLinkValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of save promotion api."
   * @param req
   * @param res
   */
  savePromotionValidation: (req, res) => {
    const schema = Joi.object({
      encrypted: Joi.string().required(),
      to_id: Joi.number().required()
    })
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey('savePromotionValidation', error))
      );
    }
    return true;
  },

  /**
   * @description "This function is used to validate all the field of vibecoin transaction."
   * @param req
   * @param res
   */
  transactionValidation: (req, res) => {
    const schema = Joi.object({
      reference_id: Joi.number().required(),
      referral_id: Joi.number().required(),
      from_type: Joi.number().required(),
      amount: Joi.number().required(),
      to_address: Joi.string().trim().max(100).required(),
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of vibecoin purchase."
   * @param req
   * @param res
   */
  purchaseValidation: (req, res) => {
    const schema = Joi.object({
      amount: Joi.number().required(),
      type: Joi.number().valid(VIBECOIN_TRANSFER_TYPE.USER, VIBECOIN_TRANSFER_TYPE.BUSINESS).required(),
      transaction_id: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of vibecoin purchase list."
   * @param req
   * @param res
   */
  purchaseListValidation: (req, res) => {
    const schema = Joi.object({
      buyer_id: Joi.number().required(),
      type: Joi.number().valid(VIBECOIN_TRANSFER_TYPE.USER, VIBECOIN_TRANSFER_TYPE.BUSINESS).required()
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  },

  /**
   * @description "This function is used to validate all the field of vibecoin purchase list."
   * @param req
   * @param res
   */
  transactionListValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.number().required(),
      type: Joi.number().valid(VIBECOIN_TRANSFER_TYPE.USER, VIBECOIN_TRANSFER_TYPE.BUSINESS, VIBECOIN_TRANSFER_TYPE.STORE).required()
    });
    const { error } = schema.validate(req);
    if (error) {

      return { status: false, message: error.message }
    }
    return { status: true, message: '' };
  }
}
