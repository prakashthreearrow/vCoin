const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class Upvotes extends Model {
    static associate (models) {
      Upvotes.hasOne(models.User, {
        sourceKey: 'user_id',
        foreignKey: 'id',
      })
      Upvotes.hasOne(models.Promotion, {
        sourceKey: 'promotion_id',
        foreignKey: 'id',
      })
    }
  }

  Upvotes.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'user',
        key: 'id'
      },
      allowNull: false
    },
    promotion_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'promotion',
        key: 'id'
      },
      allowNull: false
    } 
  }, {
    sequelize,
    modelName: 'Upvotes',
    tableName: 'upvotes'
  })
  return Upvotes;
}
