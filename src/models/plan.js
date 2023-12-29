'use strict';
const {
  Model
} = require('sequelize');
const { PLAN_MODEL } = require('../services/Constants');
const S3FileUpload = require('../services/s3FileUpload');

module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Plan.hasMany(models.FeaturesAccessByPlan, {
        sourceKey: 'id',
        foreignKey: 'plan_id',
      })
    }
  };
  Plan.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Plan title'
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      unique: true,
      comment: 'Plan price'
    },
    type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Free / Paid',
    },
    typeName: {
      type: DataTypes.VIRTUAL,
      get() {
        return PLAN_MODEL.PLAN_TYPE[this.type];
      }
    },
    plan_price_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Plan price id'
    },
    subscription_type: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 1,
      comment: '1 => Monthly / 2 => Quartaly / 3 => Yearly (default Monthly)'
    },
    subscription_type_name:{
      type: DataTypes.VIRTUAL,
      get() {
        return PLAN_MODEL.SUBSCRIPTION_TYPE[this.subscription_type];
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Plan description'
    },
    photo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Plan Photo',
      get() {
        const rawValue = this.getDataValue('photo');
        return rawValue ? S3FileUpload.mediaUrlForS3(
          rawValue
        ) : null;
      }
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Active / Inactive / deleted'
    },
    created_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    updated_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Plan',
    tableName: 'plan'
  });
  return Plan;
};