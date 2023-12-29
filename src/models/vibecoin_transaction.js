'use strict';
const { Model } = require('sequelize');
const { INACTIVE } = require('../services/Constants');

module.exports = (sequelize, DataTypes) => {
    class VibecoinTransaction extends Model {
        static associate(models) {
            VibecoinTransaction.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'from_id',
            });
            VibecoinTransaction.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'to_id',
            });
            VibecoinTransaction.belongsTo(models.Reward, {
                sourceKey: 'id',
                foreignKey: 'reward_id',
            });
        }
    };

    VibecoinTransaction.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        from_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        to_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        reward_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'reward',
                key: 'id'
            },
            allowNull: true
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        from_type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: User / 2: Business / 3: Store'
        },
        to_type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: User / 2: Business / 3: Store'
        }
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'VibecoinTransaction',
        tableName: 'vibecoin_transaction',
    });

    return VibecoinTransaction;
};