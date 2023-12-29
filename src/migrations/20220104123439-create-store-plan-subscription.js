'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('store_plan_subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      store_plan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'store_plans',
          key: 'id'
        },
        allowNull: false
      },
      event_id: {
        type: Sequelize.STRING(55),
        allowNull: false
      },
      invoice_id: {
        type: Sequelize.STRING(55),
        allowNull: false
      },
      period_end:{
        type: 'TIMESTAMPTZ',
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('store_plan_subscriptions');
  }
};