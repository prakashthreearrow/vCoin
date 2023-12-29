'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Reward extends Model {
        static associate(models) {
            Reward.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'user_id',
            });
            Reward.belongsTo(models.Promotion, {
                sourceKey: 'id',
                foreignKey: 'promotion_id',
            });
            Reward.belongsTo(models.Referrals, {
                sourceKey: 'id',
                foreignKey: 'referrals_id',
            });
            Reward.hasMany(models.VibecoinTransaction, {
                sourceKey: 'id',
                foreignKey: 'reward_id',
            });
        }
    };

    Reward.init({
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
        promotion_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'promotion',
                key: 'id'
            },
            allowNull: false
        },
        referrals_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'referrals',
                key: 'id'
            },
            allowNull: true
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'Reward',
        tableName: 'reward',
    });

    return Reward;
};