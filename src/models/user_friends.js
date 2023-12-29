'use strict';

const { Model } = require('sequelize');

const { USER_FRIENDS_MODEL } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
    class UserFriend extends Model {
        static associate(models) {
            UserFriend.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'from_id',
            });
            UserFriend.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'to_id',
            });
        }
    };

    UserFriend.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        from_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'user',
                key: 'id'
            },
            allowNull: false
        },
        to_id: {
            type: DataTypes.BIGINT,
            references: {
              model: 'user',
              key: 'id'
            },
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
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: USER_FRIENDS_MODEL.STATUS_TYPE.PENDING,
            comment: '1-Pending, 2-Accepted, 3-Rejected'
        }
    }, {
        sequelize,
        modelName: 'UserFriend',
        tableName: 'user_friends',
    });

    return UserFriend;
};