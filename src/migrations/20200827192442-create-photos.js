const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('photos', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            loyalty_card_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'loyalty_card',
                    key: 'id'
                },
                allowNull: false
            },
            photo: {
                type: Sequelize.STRING(200),
                allowNull: false,
                comment: 's3 buckect image path'
            },
            created_ip: {
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
    down: async (queryInterface) => {
        await queryInterface.dropTable('photos');
    }
}
