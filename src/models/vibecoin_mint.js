'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VibecoinMint extends Model {
        static associate(models) {
        }
    };

    VibecoinMint.init({
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
        address: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        created_ip: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'VibecoinMint',
        tableName: 'vibecoin_mint',
    });

    return VibecoinMint;
};