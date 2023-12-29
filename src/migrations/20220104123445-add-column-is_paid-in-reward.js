module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'reward',
        'is_paid',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      ),
      queryInterface.addColumn(
        'reward',
        'is_read',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('reward', 'is_paid'),
      queryInterface.removeColumn('reward', 'is_read')
    ]);
  }
};