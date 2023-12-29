const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('promotion', {
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
            type: {
                type: Sequelize.SMALLINT,
                allowNull: true,
                comment: '1-Discount / 2-Promotions / 3-Paid Referrals / 4-Cash Back'
            },
            customer_amount: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            customer_referral_amount: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            start_date: {
                type: 'TIMESTAMP',
                allowNull: true,
            },
            end_date: {
                type: 'TIMESTAMP',
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            qr_code: {
                type: Sequelize.STRING(200),
                allowNull: false,
                comment: 's3 buckect image path'
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
        await queryInterface.dropTable('promotion');
    }
}
