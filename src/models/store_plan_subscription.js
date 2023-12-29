'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StorePlanSubscription extends Model {
    static associate(models) {
      StorePlanSubscription.belongsTo(models.StorePlan, {
        sourceKey: 'id',
        foreignKey: 'store_plan_id',
      })
    }
  };
  StorePlanSubscription.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    store_plan_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'store_plans',
        key: 'id'
      },
      allowNull: false
    },
    event_id: {
      type: DataTypes.STRING(55),
      allowNull: false
    },
    invoice_id: {
      type: DataTypes.STRING(55),
      allowNull: false
    },
    period_end:{
      type: 'TIMESTAMPTZ',
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'store_plan_subscriptions',
    modelName: 'StorePlanSubscription',
  });
  return StorePlanSubscription;
};