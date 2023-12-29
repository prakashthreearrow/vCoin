'use strict';
const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
    class VibecoinLimit extends Model {
        static associate(models) {
        }
    };

    VibecoinLimit.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: Admin to User / 2: User to User'
        },
        duration: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: Day / 2: Hour / 3: Minute'
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
        modelName: 'VibecoinLimit',
        tableName: 'vibecoin_limit',
    });

    return VibecoinLimit;
};