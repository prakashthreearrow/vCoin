module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.changeColumn('address', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('address', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('user', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('user', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('business', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('business', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('email_template', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('email_template', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('features_access_by_plans', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('features_access_by_plans', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('loyalty_card', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('loyalty_card', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('otp', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('otp', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('photos', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('plan', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('plan', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('plan_features', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('plan_features', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('promotion', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('promotion', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('store', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('store', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('user_friends', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('user_friends', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('vibecoin_limit', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('vibecoin_limit', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('vibecoin_minter_role', 'created_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
                queryInterface.changeColumn('vibecoin_minter_role', 'updated_ip',
                    {
                        type: Sequelize.STRING(50),
                        allowNull: true
                    },
                    { transaction: t }
                ),
            ]);
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('address', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('address', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('user', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('user', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('business', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('business', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('email_template', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('email_template', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('features_access_by_plans', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('features_access_by_plans', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('loyalty_card', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('loyalty_card', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('otp', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('otp', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('photos', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('plan', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('plan', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('plan_features', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('plan_features', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('promotion', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('promotion', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('store', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('store', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('user_friends', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('user_friends', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('vibecoin_limit', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('vibecoin_limit', 'updated_ip', { transaction: t }),
                queryInterface.removeColumn('vibecoin_minter_role', 'created_ip', { transaction: t }),
                queryInterface.removeColumn('vibecoin_minter_role', 'updated_ip', { transaction: t }),
              
            ])
        })
    }
};