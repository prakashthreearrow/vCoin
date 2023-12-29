const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class LoyaltyCard extends Model {
    static associate(models) {
      LoyaltyCard.hasOne(models.Promotion, {
        sourceKey: 'id',
        foreignKey: 'loyalty_card_id',
      })
      LoyaltyCard.hasMany(models.Photos, {
        sourceKey: 'id',
        foreignKey: 'loyalty_card_id',
      })
      LoyaltyCard.belongsTo(models.Store, {
        sourceKey: 'id',
        foreignKey: 'store_id',
      })
      LoyaltyCard.belongsTo(models.Business, {
        sourceKey: 'id',
        foreignKey: 'business_id',
      })
    }
  }

  LoyaltyCard.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    store_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'store',
        key: 'id'
      },
      allowNull: false
    },
    business_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'business',
        key: 'id'
      },
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    updated_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: INACTIVE,
      comment: '1-active, 2-inactive, 3-deleted'
    }
  }, {
    sequelize,
    modelName: 'LoyaltyCard',
    tableName: 'loyalty_card'
  })
  return LoyaltyCard;
}
