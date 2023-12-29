'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LoginLog extends Model {
        static associate(models) {
            LoginLog.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id',
            });
        }
    };

    LoginLog.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'user',
                key: 'id'
            },
            allowNull: false
        },
        device_id: {
            type: DataTypes.STRING(225),
            allowNull: true
        },
        device_type: {
            type: DataTypes.SMALLINT,
            allowNull: true
        },
        created_ip: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'LoginLog',
        tableName: 'login_log',
    });

    return LoginLog;
};