'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlanFeature extends Model {
    static associate() {
    }
  };
  PlanFeature.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: '1 => Active, 2 => Inactive'
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
    modelName: 'PlanFeature',
    tableName: 'plan_features',
  });
  return PlanFeature;
};