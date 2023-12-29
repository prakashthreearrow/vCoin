const Joi = require('@hapi/joi');

module.exports = {
 /**
  * @description "This function is used to validate all the field of admin login as per the required condition using JOI."
  * @param req
  * @param res
  */
  adminLoginValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required(),
      password: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of admin forget password as per the required condition using JOI."
  * @param req
  * @param res
  */
  adminForgotPasswordValidation: (req, res) => {
    const schema = Joi.object({
      email: Joi.string().trim().email().max(150).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of admin change password as per the required condition using JOI."
  * @param req
  * @param res
  */
  adminChangePasswordValidation: (req, res) => {
    const schema = Joi.object().keys({
      old_password: Joi.string().trim().required(),
      password: Joi.string()
        .trim()
        .min(6)
        .required()
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
      confirm_password: Joi.string()
        .trim()
        .min(6)
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of user reset password as per the required condition using JOI."
  * @param req
  * @param res
  */
  adminResetPasswordValidation: (req, res) => {
    const schema = Joi.object({
      token: Joi.string().trim().max(250).required(),
      otp: Joi.string().trim().max(4).required(),
      password: Joi.string()
        .trim()
        .min(6)
        .required()
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
      confirm_password: Joi.string()
        .trim()
        .min(6)
    });
    const { error } = schema.validate(req)
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of user reset password as per the required condition using JOI."
  * @param req
  * @param res
  */
  emailTemplateValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.number().required(),
      title: Joi.string().trim().required(),
      subject: Joi.string().trim().required(),
      format: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req)
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of admin forget password as per the required condition using JOI."
  * @param req
  * @param res
  */
  adminResendOtpValidation: (req, res) => {
    const schema = Joi.object({
      token: Joi.string().trim().max(150).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of admin edit api."
  * @param req
  * @param res
  */
  adminEditValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.string().optional(),
      first_name: Joi.string().trim().max(50).required(),
      last_name: Joi.string().trim().max(50).required()
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of add plan api."
  * @param req
  * @param res
  */
  addPlanValidation: (req, res) => {
    const schema = Joi.object({
      title: Joi.string().trim().max(50).required(),
      price: Joi.number().min(1).max(50).required(),
      plan_price_id: Joi.string().trim().max(50).required(),
      description: Joi.string().trim().max(200).required(),
      type: Joi.number().required(),
      id: Joi.number().optional()
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of vibecoin limit as per the required condition using JOI."
  * @param req 
  * @param res
  */
  vibecoinLimitValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.number().required(),
      amount: Joi.string().trim().required(),
      duration: Joi.string().trim().required()
    });
    const { error } = schema.validate(req)
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },


 /**
  * @description "This function is used to validate all the field of admin add mint api."
  * @param req
  * @param res
  */
  mintValidation: (req, res) => {
    const schema = Joi.object({
      address: Joi.string().trim().required(),
      amount: Joi.number().min(1).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of admin add minter role api."
  * @param req
  * @param res
  */
  minterRoleValidation: (req, res) => {
    const schema = Joi.object({
      address: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },

 /**
  * @description "This function is used to validate all the field of mint delete api."
  * @param req
  * @param res
  */
  deleteMintValidation: (req, res) => {
    const schema = Joi.object({
      id: Joi.number().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return { status: false, message: error.message };
    }
    return { status: true, message: '' };
  },
};

