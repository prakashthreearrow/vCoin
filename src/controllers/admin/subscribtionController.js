const Helper = require('../../services/Helper');
const { Plan, StorePlan, Store, Business } = require('../../models');
var message = '';

module.exports = {

    /**
      * @description This function is to get subscribtion list.
      * @param req
      * @param res
      */
    subscribtionList: async (req, res) => {
        try {
            const subscriptionData = await StorePlan.findAll({
                include: [{ model: Store, attributes: ['id', 'business_id', 'name'], include: [{ model: Business, attributes: ['id', 'name'] }] },
                { model: Plan, attributes: ['id', 'title'] }],
                distinct: true
            })

            res.render('subscribtions/index', { data: { subscriptionData }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('SuccessMessage') });
        } catch (error) {
            req.flash('errorMessage', res.locals.__('internalError'));
            res.redirect("dashboard");
        }
    }
}