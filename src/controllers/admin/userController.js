const { Op } = require('sequelize');
const Helper = require('../../services/Helper');
const { ACTIVE, INACTIVE, USER_MODEL, ORDER_BY } = require('../../services/Constants');
const { User, Address } = require('../../models');

module.exports = {

  /* @description This function is to get user list.
  * @param req
  * @param res
  */
  userList: async (req, res) => {
    try {
      let sorting = [['id', ORDER_BY.DESC]];
      let users = await User.findAndCountAll({
        attributes: ['id', 'first_name', 'last_name', 'full_name', 'nick_name', 'profile_photo', 'profile_photo_path', 'phone', 'email', 'login_type', 'social_media_id', 'status', 'createdAt'],
        include: [
          {
            model: Address,
            attributes: ['id', 'apt_suite', 'street_address', 'city', 'country', 'latitude', 'longitute'],
          }
        ],
        where: {
          type: USER_MODEL.TYPE.USER_TYPE,
          status: {
            [Op.in]: [ACTIVE, INACTIVE],
          }
        },
        order: sorting,
      });
      const result = users.rows;
      res.render('user/index', { data: { result }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },
}
