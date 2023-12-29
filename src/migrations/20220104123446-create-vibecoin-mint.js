module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('vibecoin_mint', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            amount: {
                type: Sequelize.DOUBLE,
                allowNull: false
            },
            address: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            created_ip: {
                type: Sequelize.STRING(15),
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('vibecoin_mint');
    }
};