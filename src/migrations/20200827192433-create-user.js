const { INACTIVE } = require('../services/Constants');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV1,
                unique: true,
                comment: 'Unique generated id'
            },
            stripe_customer_id: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            type: {
                type: Sequelize.INTEGER,
                comment: '1:super-admin,2:user',
            },
            first_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            nick_name: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            profile_photo: {
                type: Sequelize.STRING(200),
                allowNull: false,
                comment: 's3 buckect image path'
            },
            phone: {
                type: Sequelize.STRING(15),
                allowNull: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email_verified_at: {
                type: 'TIMESTAMP',
                allowNull: true
            },
            email_verified_attempt: {
                type: Sequelize.SMALLINT,
                defaultValue: 0
            },
            email_verified_block_at: {
                type: 'TIMESTAMP',
                allowNull: true
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'hash password'
            },
            vibecoin_balance: {
                type: Sequelize.DOUBLE(),
                allowNull: true
            },
            your_job: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            fcm_token: {
                type: Sequelize.STRING(200),
                allowNull: true,
                comment: 'token to send push notification.'
            },
            device_type: {
                type: Sequelize.SMALLINT,
                allowNull: true,
                comment: '1-Andriod, 2-Apple'
            },
            login_type: {
                type: Sequelize.SMALLINT,
                allowNull: false,
                comment: '1-Normal / 2-Google / 3-Facebook / 4-Apple'
            },
            social_media_id: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            address_id: {
                type: Sequelize.BIGINT,
                references: {
                    model: 'address',
                    key: 'id',
                },
                allowNull: true
            },
            created_ip: {
                type: Sequelize.STRING(15),
                allowNull: true
            },
            updated_ip: {
                type: Sequelize.STRING(15),
                allowNull: true
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: INACTIVE,
                comment: '1-active, 2-inactive, 3-deleted'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('user');
    }
}
