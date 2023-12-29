'use strict';
const { INACTIVE } = require('../services/Constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vibecoin_limit', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      type: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1: Admin to User / 2: User to User'
      },
      duration: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '1: Day / 2: Hour / 3: Minute'
      },
      created_ip: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      updated_ip: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: INACTIVE,
        comment: '1-active, 2-inactive, 3-deleted'
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
    await queryInterface.dropTable('vibecoin_limit');
  }
};