const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const { ACTIVE, PLAN_MODEL, IMAGE_STORAGE_PATH, FILE_MINETYPE, IMAGE_SIZE, ORDER_BY } = require('../../services/Constants');
const {
    addPlanValidation
} = require('../../services/AdminValidation');
const { Plan, PlanFeature, FeaturesAccessByPlan } = require('../../models');
const Helper = require('../../services/Helper');
const S3FileUpload = require('../../services/s3FileUpload');
const Response = require('../../services/Response');

module.exports = {

    /**
      * @description This function is to get plan list.
      * @param req
      * @param res
      */
    planList: async (req, res) => {
        try {
            let sorting = [['createdAt', ORDER_BY.DESC]];
            let plansInfo = await Plan.findAndCountAll({
                attributes: ['id', 'title', 'price', 'type', 'plan_price_id', 'subscription_type', 'description', 'photo', 'status', 'createdAt'],
                order: sorting,
                distinct: true
            });
            const result = plansInfo.rows;
            var plans = [];
            for (let i = 0; i < result.length; i++) {
                plans = [...plans, {
                    id: result[i].id, title: result[i].title, price: result[i].price, type: result[i].type, plan_price_id: result[i].plan_price_id,
                    subscription_type: result[i].subscription_type, description: result[i].description, photo: result[i].photo, status: result[i].status, createdAt: result[i].createdAt
                }];
            }
            const planFeatures = await PlanFeature.findAll({
                distinct: true
            });

            res.render('plans/index', { data: { plans, planFeatures }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('dashboard');
        }
    },

    /**
     * @description This function is to get plan features by plan.
     * @param req
     * @param res
     */
    fetchPlanFeaturesByPlan: async (req, res) => {
        try {
            const planFeatures = await FeaturesAccessByPlan.findAll({
                where: {
                    plan_id: req.body.id
                }
            })
            return Response.successResponseData(res, planFeatures, StatusCodes.OK, res.__('success'));

        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('plans');
        }
    },

    /**
      * @description This function is to create new plan.
      * @param req
      * @param res
      */
    addPlan: async (req, res) => {
        res.render('plans/add', { Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    },

    /**
      * @description This function is to save new plan.
      * @param req
      * @param res
      */
    savePlan: async (req, res) => {
        try {
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const requestParams = req.body;
            const validate = addPlanValidation(requestParams, res);

            if (!validate.status) {
                req.flash('errorMessage', validate.message);
                res.redirect('plans');
            }

            if (validate.status === true) {

                const PlanObj = {
                    ...requestParams,
                    subscription_type: 1, //MONTHLY
                    status: ACTIVE,
                    'created_ip': SYSTEM_IP,
                    'updated_ip': SYSTEM_IP
                };

                var isImageExist = false;
                if (requestParams && req.file.size > 0) {
                    isImageExist = true;
                    await Helper.imageValidation(req, res, req.file);
                    await Helper.imageSizeValidation(req, res, req.file.size);

                    var imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.file.originalname));
                    PlanObj.photo = `${PLAN_MODEL.PHOTO}/${imageName}`;
                }

                let isPlanCreated = await Plan.create(PlanObj);
                if (isPlanCreated) {
                    if (isImageExist) {
                        await S3FileUpload.uploadImageS3(req.file.path, imageName, PLAN_MODEL.PHOTO, res);
                    }

                    fs.unlink(`${IMAGE_STORAGE_PATH}/${req.file.filename}`, () => {
                    });

                    req.flash('successMessage', res.locals.__('planAddedSuccessfully'));
                    res.redirect('plans');
                }
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('plans');
        }
    },

    /**
      * @description This function is to edit new plan.
      * @param req
      * @param res
      */
    editPlan: async (req, res) => {
        try {
            if (req.params.id) {
                let planData = await Plan.findOne({
                    where: {
                        id: req.params.id
                    }
                });

                res.render('plans/edit', { data: planData, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('planUpdatedSuccessfully') });
                return
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('plans');
        }
    },

    /**
     * @description This function is to edit plan.
     * @param req
     * @param res
     */
    updatePlan: async (req, res) => {
        try {

            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const requestParams = req.body;

            const validate = addPlanValidation(requestParams, res);

            if (!validate.status) {
                req.flash('errorMessage', validate.message);
                res.redirect('plans');
            }

            if (validate.status === true) {

                const PlanObj = {
                    ...requestParams,
                    subscription_type: 1, //MONTHLY
                    'updated_ip': SYSTEM_IP
                };
                delete PlanObj.id;
                
                var isImageExist = false;
                if (req.file && req.file.size > 0) {
                    isImageExist = true;
                    const extension = req.file.mimetype ? req.file.mimetype : req.file.type;
                    const imageExtArr = [FILE_MINETYPE.JPG, FILE_MINETYPE.JPEG, FILE_MINETYPE.PNG];
                    if (req.file && (!imageExtArr.includes(extension))) {
                        req.flash('errorMessage', res.locals.__('imageInvalid'));
                        res.redirect('plans');
                    }

                    if (req.file.size > IMAGE_SIZE) {
                        req.flash('errorMessage', res.locals.__('LargeImage'));
                        res.redirect('plans');
                    }

                    var imageName = Helper.generateUniqueFileName(await Helper.removeSpecialCharacter(req.file.originalname));
                    PlanObj.photo = `${PLAN_MODEL.PHOTO}/${imageName}`;
                }

                let isPlanUpdated = await Plan.update(PlanObj, {
                    where: {
                        id: requestParams.id
                    }
                });

                if (isPlanUpdated) {
                    if (isImageExist) {
                        await S3FileUpload.uploadImageS3(req.file.path, imageName, PLAN_MODEL.PHOTO, res);
                        fs.unlink(`${IMAGE_STORAGE_PATH}/${req.file.filename}`, () => {
                        });
                    }

                    req.flash('successMessage', res.locals.__('planUpdatedSuccessfully'));
                    res.redirect('plans');
                }
            }
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect('plans');
        }
    },

    /**
     * @description This function is to add plan fatures to plan.
     * @param req
     * @param res
     */
    addPlanFeaturesToPlan: async (req, res) => {
        try {
            const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const requestParams = req.body;

            const planFeturesRows = requestParams.plan_feature.filter((el) => el.id != undefined).map((elPlan) => {
                return {
                    plan_id: requestParams.plan_id,
                    plan_feature_id: elPlan.id,
                    access_type: elPlan.access_type,
                    limited_value: elPlan.limited_value || null,
                    created_ip: SYSTEM_IP,
                    updated_ip: SYSTEM_IP
                }
            });
            await FeaturesAccessByPlan.destroy({ where: { plan_id: requestParams.plan_id } });

            let isPlanFeatureCreated = await FeaturesAccessByPlan.bulkCreate(planFeturesRows);
            if (isPlanFeatureCreated) {

                req.flash('SuccessMessage', res.locals.__('PlanFeaturesAddedSuccessfully'));
                res.redirect('plans');
            }

        } catch (error) {
            req.flash('successMessage', res.locals.__('internalError'));
            res.redirect('plans');
        }
    }
}