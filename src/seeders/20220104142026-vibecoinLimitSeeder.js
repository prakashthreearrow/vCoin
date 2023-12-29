const { ACTIVE, VIBECOIN_LIMIT } = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('vibecoin_limit', [
      {
        amount: 10000,
        type: VIBECOIN_LIMIT.TYPE.ADMIN_TO_USER,
        duration: VIBECOIN_LIMIT.DURATION.DAY,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        amount: 5000,
        type: VIBECOIN_LIMIT.TYPE.ADMIN_TO_BUSINESS,
        duration: VIBECOIN_LIMIT.DURATION.HOUR,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // {
      //   amount: 13000,
      //   type: VIBECOIN_LIMIT.TYPE.USER_TO_USER,
      //   duration: VIBECOIN_LIMIT.DURATION.DAY,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      // {
      //   amount: 15000,
      //   type: VIBECOIN_LIMIT.TYPE.USER_TO_BUSINESS,
      //   duration: VIBECOIN_LIMIT.DURATION.MINUTE,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      // {
      //   amount: 9000,
      //   type: VIBECOIN_LIMIT.TYPE.USER_TO_STORE,
      //   duration: VIBECOIN_LIMIT.DURATION.HOUR,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      // {
      //   amount: 7000,
      //   type: VIBECOIN_LIMIT.TYPE.BUSINESS_TO_USER,
      //   duration: VIBECOIN_LIMIT.DURATION.HOUR,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      // {
      //   amount: 18000,
      //   type: VIBECOIN_LIMIT.TYPE.BUSINESS_TO_STORE,
      //   duration: VIBECOIN_LIMIT.DURATION.DAY,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      // {
      //   amount: 8000,
      //   type: VIBECOIN_LIMIT.TYPE.STORE_TO_USER,
      //   duration: VIBECOIN_LIMIT.DURATION.MINUTE,
      //   status: ACTIVE,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('vibecoin_limit', null, {});
  },
}