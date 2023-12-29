const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('follow', {
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
                allowNull: true
            },
            business_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'business',
                    key: 'id'
                },
                allowNull: false
            },
            store_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'store',
                    key: 'id'
                },
                allowNull: true
            },
            user_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('follow');
    }
}
