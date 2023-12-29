const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Web3Account extends Model {
        static associate(models) {
        }
    };

    Web3Account.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        reference_id: {
            type: DataTypes.BIGINT
        },
        address: {
            type: DataTypes.STRING(255),
            comment: 'Address'
        },
        private_key: {
            type: DataTypes.TEXT,
            comment: 'Private Key'
        },
        type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            comment: '1: User / 2: Business / 3: Store'
        },
    }, {
        sequelize,
        modelName: 'Web3Account',
        tableName: 'web3_accounts',
    });

    return Web3Account;
};