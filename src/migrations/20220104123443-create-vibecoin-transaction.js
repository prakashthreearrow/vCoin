const { INACTIVE } = require('../services/Constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vibecoin_transaction', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      from_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      to_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      reward_id: {
        type: Sequelize.BIGINT,
        references: {
            model: 'reward',
            key: 'id'
        },
        allowNull: true
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      from_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1: User / 2: Business / 3: Store'
      },
      to_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1: User / 2: Business / 3: Store'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vibecoin_transaction');
  }
};