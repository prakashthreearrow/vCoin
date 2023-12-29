const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('otp', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            otp: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            otp_expiry: {
                type: Sequelize.DATE,
                allowNull: true
            },
            otp_type: {
                type: Sequelize.SMALLINT,
                allowNull: true
            },
            user_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: true
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
        await queryInterface.dropTable('otp');
    }
}
