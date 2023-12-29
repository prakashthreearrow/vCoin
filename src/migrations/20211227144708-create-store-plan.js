'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('store_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      store_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'store',
          key: 'id'
        },
        allowNull: false
      },
      plan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'plan',
          key: 'id'
        },
        allowNull: false
      },
      subscribtion_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
      subscription_end_date:{
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
    await queryInterface.dropTable('store_plans');
  }
};