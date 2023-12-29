const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('store', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            business_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'business',
                    key: 'id'
                },
                allowNull: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            address_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'address',
                    key: 'id'
                },
                allowNull: true
            },
            description: {
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
        await queryInterface.dropTable('store');
    }
}
