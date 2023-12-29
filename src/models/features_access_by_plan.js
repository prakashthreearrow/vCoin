'use strict';
const { PLAN_MODEL } = require('../services/Constants');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeaturesAccessByPlan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FeaturesAccessByPlan.belongsTo(models.PlanFeature, {
        sourceKey: 'id',
        foreignKey: 'plan_feature_id',
      })
    }
  };
  FeaturesAccessByPlan.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    plan_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'plan',
        key: 'id'
      },
      allowNull: false
    },
    plan_feature_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'plan_features',
        key: 'id'
      },
      allowNull: false
    },
    access_type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: '1 => Yes, 2 => No, 3 => Limited, 4 => Unlimited'
    },
    access_type_name:{
      type: DataTypes.VIRTUAL,
      get() {
        return PLAN_MODEL.ACCESS_TYPE[this.access_type];
      }
    },
    limited_value: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'if access_type is equal to Limited'
    },
    created_ip: {
      type: DataTypes.STRING(15),
      allowNull: true 
    },
    updated_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FeaturesAccessByPlan',
    tableName: 'features_access_by_plans',
  });
  return FeaturesAccessByPlan;
};