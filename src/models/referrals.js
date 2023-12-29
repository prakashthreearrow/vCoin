'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Referrals extends Model {
        static associate(models) {
            Referrals.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'to_id',
            });
            Referrals.belongsTo(models.User, {
                sourceKey: 'id',
                foreignKey: 'from_id',
            });
            Referrals.belongsTo(models.Promotion, {
                sourceKey: 'id',
                foreignKey: 'promotion_id',
            });
            Referrals.hasMany(models.Reward, {
                sourceKey: 'id',
                foreignKey: 'referrals_id',
              });
        }
    };

    Referrals.init({
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
        promotion_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'promotion',
                key: 'id'
            },
            allowNull: false
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1-referral, 2-upvotes'
        }
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'Referrals',
        tableName: 'referrals',
    });

    return Referrals;
};