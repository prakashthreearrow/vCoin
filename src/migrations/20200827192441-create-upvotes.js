module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('upvotes', {
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
                allowNull: false
            },
            promotion_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'promotion',
                    key: 'id'
                },
                allowNull: false
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
        await queryInterface.dropTable('upvotes');
    }
}
