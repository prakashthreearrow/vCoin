'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      title: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Plan title'
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        unique: true,
        comment: 'Plan price'
      },
      type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: 'Free / Paid'
      },
      plan_price_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Plan price id'
      },
      subscription_type: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        defaultValue: 1,
        comment: '1 => Monthly / 2 => Quartaly / 3 => Yearly (default Monthly)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Plan description'
      },
      photo: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Plan Photo'
      },
      status: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: 'Active / Inactive / deleted'
      },
      created_ip: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      updated_ip: {
        type: Sequelize.STRING(15),
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
    await queryInterface.dropTable('plan');
  }
};