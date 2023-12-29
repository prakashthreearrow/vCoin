const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('email_template', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            type: {
                type: Sequelize.STRING(20),
                allowNull: false
              },
            title: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            subject: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            format: {
                type: Sequelize.TEXT,
                allowNull: false
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
    down: async (queryInterface) => {
        await queryInterface.dropTable('email_template');
    }
}
