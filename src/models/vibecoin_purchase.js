'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VibecoinPurchase extends Model {
        static associate(models) {
        }
    };

    VibecoinPurchase.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        buyer_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: User / 2: Business'
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Stripe payment transaction id'
        },
        vibecoin_transaction_status: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            comment: '1: Success / 2: Fail'
        },
    }, {
        sequelize,
        updatedAt: false,
        modelName: 'VibecoinPurchase',
        tableName: 'vibecoin_purchase',
    });

    return VibecoinPurchase;
};