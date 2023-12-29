const { Model } = require('sequelize');
const S3FileUpload = require('../../src/services/s3FileUpload');

module.exports = (sequelize, DataTypes) => {
  class Photos extends Model {
    static associate (models) {
      Photos.belongsTo(models.LoyaltyCard, {
        sourceKey: 'id',
        foreignKey: 'loyalty_card_id',
      })
    }
  }

  Photos.init({
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
    photo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 's3 buckect image path',
      get() {
        const rawValue = this.getDataValue('photo');
        return S3FileUpload.mediaUrlForS3(rawValue);
      }
    },
    created_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Photos',
    tableName: 'photos'
  })
  return Photos;
}
