'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('features_access_by_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      plan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'plan',
          key: 'id'
        },
        allowNull: false
      },
      plan_feature_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'plan_features',
          key: 'id'
        },
        allowNull: false
      },
      access_type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1 => Yes, 2 => No, 3 => Limited, 4 => Unlimited'
      },
      limited_value: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'if access_type is eqal to Limited'
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
    await queryInterface.dropTable('features_access_by_plans');
  }
};