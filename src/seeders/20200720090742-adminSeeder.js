const bcrypt = require('bcrypt');
const { ACTIVE, USER_MODEL, ADMIN_MODEL } = require('../services/Constants');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const hash = bcrypt.hashSync(ADMIN_MODEL.PASSWORD, 10);
    return queryInterface.bulkInsert('user', [
      {
        type: USER_MODEL.TYPE.ADMIN_TYPE,
        uuid: uuidv4(),
        first_name: 'admin',
        last_name: 'admin',
        profile_photo: '',
        email: ADMIN_MODEL.EMAIL,
        password: hash,
        login_type: parseInt(USER_MODEL.LOGIN_TYPE.NORMAL),
        email_verified_at: moment().toDate(),
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('user', null, {});
  },
}
