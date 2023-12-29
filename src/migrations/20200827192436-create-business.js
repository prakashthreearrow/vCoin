const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('business', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: true
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            fund: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            photo: {
                type: Sequelize.STRING(200),
                allowNull: true,
                comment: 's3 buckect image path'
            },
            description: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('business');
    }
}
