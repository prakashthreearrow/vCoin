const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.User, {
        sourceKey: 'address_id',
        foreignKey: 'id',
      })
      Address.hasOne(models.Store, {
        sourceKey: 'id',
        foreignKey: 'address_id'
      })
    }
  }

  Address.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    apt_suite: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    street_address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitute: {
      type: DataTypes.DOUBLE,
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
    modelName: 'Address',
    tableName: 'address'
  })
  return Address;
}
