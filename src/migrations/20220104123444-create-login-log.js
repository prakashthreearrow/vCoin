module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('login_log', {
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
      device_id: {
        type: Sequelize.STRING(225),
        allowNull: true
      },
      device_type: {
        type: Sequelize.SMALLINT,
        allowNull: true
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
    await queryInterface.dropTable('login_log');
  }
};