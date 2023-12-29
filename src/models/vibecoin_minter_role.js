'use strict';
const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
    class VibecoinMinterRole extends Model {
        static associate(models) {
        }
    };

    VibecoinMinterRole.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(100),
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
        modelName: 'VibecoinMinterRole',
        tableName: 'vibecoin_minter_role',
    });

    return VibecoinMinterRole;
};