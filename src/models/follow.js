const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      Follow.belongsTo(models.Business, {
        sourceKey: 'id',
        foreignKey: 'business_id',
      });
    }
  }

  Follow.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    loyalty_card_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'loyalty_card',
        key: 'id'
      },
      allowNull: true
    },
    business_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'business',
        key: 'id'
      },
      allowNull: false
    },
    store_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'store',
        key: 'id'
      },
      allowNull: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'user',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Follow',
    tableName: 'follow'
  })
  return Follow;
}
