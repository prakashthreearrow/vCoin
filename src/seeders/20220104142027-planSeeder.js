const { ACTIVE, PLAN_TYPE } = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('plan', [
      {
        title: 'Free',
        price: 1,
        type: PLAN_TYPE.FREE,
        plan_price_id: 'price_1KBvliCpea62pB81Y72LuqwB',
        description: 'Free',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Premium',
        price: 49,
        type: PLAN_TYPE.PAID,
        plan_price_id: 'price_1KBvliCpea62pB81KxmKtaKE',
        description: 'Premium',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Enterprice',
        price: 199,
        type: PLAN_TYPE.PAID,
        plan_price_id: 'price_1KBvliCpea62pB81IkKNXwtc',
        description: 'Enterprice',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('plan', null, {});
  },
}