'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GasFeeTransfer extends Model {
        static associate(models) {
        }
    };

    GasFeeTransfer.init({
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
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'GasFeeTransfer',
        tableName: 'gas_fee_transfer',
    });

    return GasFeeTransfer;
};