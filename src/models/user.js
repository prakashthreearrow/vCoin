const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');
const S3FileUpload = require('../../src/services/s3FileUpload');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Address, {
        sourceKey: 'address_id',
        foreignKey: 'id',
      });
      User.hasOne(models.Otp, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      });
      User.hasOne(models.Business, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      });
      User.belongsToMany(models.Store, {
        through: "follow",
        as: "stores",
        foreignKey: "user_id",
      });
      User.belongsTo(models.Upvotes, {
        sourceKey: 'user_id',
        foreignKey: 'id',
      });
      User.hasMany(models.UserFriend, {
        sourceKey: 'id',
        foreignKey: 'to_id',
      });
      User.hasMany(models.UserFriend, {
        sourceKey: 'id',
        foreignKey: 'from_id',
      });
      User.hasOne(models.Referrals, {
        sourceKey: 'id',
        foreignKey: 'from_id',
      });
      User.hasOne(models.Referrals, {
        sourceKey: 'id',
        foreignKey: 'to_id',
      });
      User.hasMany(models.LoginLog, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      });
      User.hasMany(models.Reward, {
        sourceKey: 'id',
        foreignKey: 'user_id',
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      unique: true,
      comment: 'Unique generated id'
    },
    stripe_customer_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      comment: '1:super-admin,2:user',
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    full_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.first_name} ${this.last_name}`;
      }
    },
    nick_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    profile_photo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 's3 buckect image path'
    },
    profile_photo_path: {   
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('profile_photo');
        return S3FileUpload.mediaUrlForS3(rawValue);
      },
      comment: 's3 buckect image path'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email_verified_at: {
      type: 'TIMESTAMP',
      allowNull: true
    },
    email_verified_attempt: {
      type: DataTypes.SMALLINT,
      defaultValue: 0
    },
    email_verified_block_at: {
      type: 'TIMESTAMP',
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'hash password'
    },
    vibecoin_balance: {
      type: DataTypes.DOUBLE(),
      allowNull: true
    },
    your_job: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fcm_token: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'token to send push notification.'
    },
    device_type: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      comment: '1-Andriod, 2-Apple'
    },
    login_type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: '1-Normal / 2-Google / 3-Facebook / 4-Apple'
    },
    social_media_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'address',
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
    modelName: 'User',
    tableName: 'user'
  })
  return User;
}
