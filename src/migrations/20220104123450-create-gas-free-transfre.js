const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('gas_fee_transfer', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            address: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
        await queryInterface.dropTable('gas_fee_transfer');
    }
};