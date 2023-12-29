const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('address', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            apt_suite: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            street_address: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            country: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            latitude: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            longitute: {
                type: Sequelize.DOUBLE,
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
        await queryInterface.dropTable('address');
    }
}
