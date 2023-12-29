'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('web3_accounts', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            reference_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Address'
            },
            private_key: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Private Key'
            },
            type: {
                type: Sequelize.SMALLINT,
                allowNull: false,
                comment: '1: User / 2: Business / 3: Store'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('web3_accounts');
    }
};
