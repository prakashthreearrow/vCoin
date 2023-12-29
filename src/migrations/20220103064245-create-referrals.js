module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('referrals', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            from_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'user',
                    key: 'id'
                },
                allowNull: false
            },
            to_id: {
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
            is_paid: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            type: {
                type: Sequelize.SMALLINT,
                allowNull: false,
                comment: '1-referral, 2-upvotes'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('referrals');
    }
};