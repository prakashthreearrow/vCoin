const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      Otp.belongsTo(models.User, {
        sourceKey: 'id',
        foreignKey: 'user_id'
      })
    }
  }

  Otp.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    otp_type: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'user',
        key: 'id'
      },
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
    modelName: 'Otp',
    tableName: 'otp',
    timestamps: true,
  })
  return Otp;
}
