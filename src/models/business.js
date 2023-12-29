const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');
const S3FileUpload = require('../../src/services/s3FileUpload');

module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    static associate (models) {
      Business.belongsTo(models.User, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      });
      Business.hasOne(models.Store, {
        sourceKey: 'id',
        foreignKey: 'business_id'
      });
      Business.hasOne(models.LoyaltyCard, {
        sourceKey: 'id',
        foreignKey: 'business_id',
      });
      Business.hasMany(models.Follow, {
        sourceKey: 'id',
        foreignKey: 'business_id',
      });
    }
  }

  Business.init({
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
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fund: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 's3 buckect image path'
    },
    photo_path: {   
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('photo');
        return S3FileUpload.mediaUrlForS3(rawValue);
      },
      comment: 's3 buckect image path'
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
    modelName: 'Business',
    tableName: 'business'
  })
  return Business;
}
