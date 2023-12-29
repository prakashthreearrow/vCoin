'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StorePlan extends Model {
    static associate(models) {
      StorePlan.belongsTo(models.Store, {
        sourceKey: 'id',
        foreignKey: 'store_id',
      });
      StorePlan.belongsTo(models.Plan, {
        sourceKey: 'id',
        foreignKey: 'plan_id',
      });
      StorePlan.belongsTo(models.Store, {
        sourceKey: 'id',
        foreignKey: 'store_id',
      });
      StorePlan.hasOne(models.StorePlanSubscription, {
        sourceKey: 'id',
        foreignKey: 'store_plan_id',
      });
    }
  };
  StorePlan.init({
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
    plan_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'plan',
        key: 'id'
      },
      allowNull: false
    },
    subscribtion_id:{
      type: DataTypes.STRING,
      allowNull: true
    },
    subscription_end_date:{
      type: 'TIMESTAMPTZ',
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'store_plans',
    modelName: 'StorePlan',
  });
  return StorePlan;
};