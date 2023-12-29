const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');
const S3FileUpload = require('../../src/services/s3FileUpload');

module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    static associate(models) {
      Promotion.belongsTo(models.LoyaltyCard, {
        sourceKey: 'id',
        foreignKey: 'loyalty_card_id',
      });
      Promotion.belongsTo(models.Upvotes, {
        sourceKey: 'promotion_id',
        foreignKey: 'id',
      });
      Promotion.hasOne(models.Referrals, {
        sourceKey: 'id',
        foreignKey: 'promotion_id',
      });
      Promotion.hasMany(models.Reward, {
        sourceKey: 'id',
        foreignKey: 'promotion_id',
      });
    }
  }

  Promotion.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    loyalty_card_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'loyalty_card',
        key: 'id'
      },
      allowNull: false
    },
    type: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      comment: '1-Discount / 2-Promotions / 3-Paid Referrals / 4-Cash Back'
    },
    customer_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    customer_referral_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    start_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    end_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qr_code: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 's3 buckect image path'
    },
    photo: {
      type: DataTypes.STRING(200),
      allowNull: false,
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
    modelName: 'Promotion',
    tableName: 'promotion'
  })
  return Promotion;
}
