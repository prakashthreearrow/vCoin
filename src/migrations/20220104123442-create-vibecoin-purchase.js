'use strict';
const { INACTIVE } = require('../services/Constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vibecoin_purchase', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      buyer_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1: User / 2: Business'
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Stripe payment transaction id'
      },
      vibecoin_transaction_status: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        comment: '1: Success / 2: Fail'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vibecoin_purchase');
  }
};