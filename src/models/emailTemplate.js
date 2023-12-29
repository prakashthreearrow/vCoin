const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
  class EmailTemplate extends Model {
    static associate(models) {
    }
  }

  EmailTemplate.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    format: {
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
    modelName: 'EmailTemplate',
    tableName: 'email_template'
  })
  return EmailTemplate;
}
