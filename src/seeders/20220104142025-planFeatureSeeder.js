const { ACTIVE } = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('plan_features', [
      {
        name: 'Vibecoin Transaction',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Land NFT',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Photo',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Promotions',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Unlimited Messages',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Crypto Wallet',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Customer Loyalty Card',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Analytics',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Enterprise Administration',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '24/7 Support',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Designated Customer Success Team',
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('plan_features', null, {});
  },
}