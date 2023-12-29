const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.belongsTo(models.Business, {
        sourceKey: 'id',
        foreignKey: 'business_id',
      });
      Store.belongsTo(models.Address, {
        sourceKey: 'id',
        foreignKey: 'address_id',
      });
      Store.belongsToMany(models.User, {
        through: "follow",
        as: "users",
        foreignKey: "store_id",
      });
      Store.hasOne(models.LoyaltyCard, {
        sourceKey: 'id',
        foreignKey: 'store_id',
      });
      Store.hasMany(models.StorePlan, {
        sourceKey: 'id',
        foreignKey: 'store_id',
      });
    }
  }

  Store.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'business',
        key: 'id'
      },
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    admin_email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'address',
        key: 'id'
      },
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
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
    modelName: 'Store',
    tableName: 'store'
  })
  return Store;
}
