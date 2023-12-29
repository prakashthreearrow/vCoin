module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reward', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
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
      referrals_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'referrals',
          key: 'id'
        },
        allowNull: true
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reward');
  }
};