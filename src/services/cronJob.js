const { User, LoyaltyCard, Promotion, Web3Account, VibecoinTransaction, Reward, Business, GasFeeTransfer } = require('../models');
const Web3Helper = require('../services/Web3Helper');
const { ACTIVE, REFERRALS_MODEL, VIBECOIN_TRANSFER_TYPE, ORDER_BY, LIMIT, USER_MODEL, DELETE } = require('../services/Constants');

module.exports = {
   /**
    * @description This function use to transfer amount from user to store
    * @return {*}
    */
    rewardsTransfer: async () => {
        try {
            let sorting = [['createdAt', ORDER_BY.ASC]];
            let rewardInfo = await Reward.findAndCountAll({
                attributes: ['id', 'user_id', 'promotion_id', 'amount'],
                where: {
                    is_paid: REFERRALS_MODEL.FALSE,
                    is_read: REFERRALS_MODEL.FALSE,
                },
                order: sorting,
                limit: LIMIT,
            });

            const rewardData = rewardInfo.rows;
            for (let i = 0; i < rewardData.length; i++) {
                await Reward.update({ is_read: REFERRALS_MODEL.TRUE }, { where: { id: rewardData[i].id } });
                // find store id
                let promotionInfo = await Promotion.findOne({
                    attributes: ['id', 'loyalty_card_id'],
                    where: {
                        id: rewardData[i].promotion_id,
                        status: ACTIVE,
                    }
                });

                let loyaltyCardInfo = null;
                let businessInfo = null;
                if (promotionInfo) {
                    loyaltyCardInfo = await LoyaltyCard.findOne({
                        attributes: ['id', 'store_id'],
                        where: {
                            id: promotionInfo.loyalty_card_id,
                            status: ACTIVE,
                        }
                    });

                    businessInfo = await Business.findOne({
                        attributes: ['id', 'user_id'],
                        where: {
                            id: promotionInfo.loyalty_card_id,
                            status: ACTIVE,
                        }
                    });
                }

                let userInfo = null;
                if (businessInfo) {
                    userInfo = await User.findOne({
                        attributes: ['id', 'email'],
                        where: {
                            id: businessInfo.user_id,
                            status: ACTIVE,
                        }
                    });
                }

                let web3WalletUser = await Web3Account.findOne({
                    attributes: ['id', 'address'],
                    where: {
                        reference_id: rewardData[i].user_id,
                        type: VIBECOIN_TRANSFER_TYPE.USER,
                    }
                });

                let web3WalletStore = await Web3Account.findOne({
                    attributes: ['id', 'address', 'private_key'],
                    where: {
                        reference_id: parseInt(loyaltyCardInfo.store_id),
                        type: VIBECOIN_TRANSFER_TYPE.STORE,
                    }
                });

                if (web3WalletUser && userInfo && web3WalletStore) {
                    const transferSuccess = new Promise((resolve, reject) => {
                        resolve(Web3Helper.transaction(false, web3WalletUser.address, rewardData[i].amount, userInfo.id, userInfo.email, web3WalletStore.address, web3WalletStore.private_key))
                    });
                    //let transferSuccess = await Web3Helper.transaction(false, web3WalletUser.address, rewardData[i].amount, userInfo.id, userInfo.email, web3WalletStore.address, web3WalletStore.private_key);
                    transferSuccess.then((transfer) => {
                        if (transfer === true) {
                            const vibecoinTransactionObj = {
                                reward_id: rewardData[i].id,
                                amount: rewardData[i].amount,
                                from_id: parseInt(loyaltyCardInfo.store_id),
                                to_id: parseInt(rewardData[i].user_id),
                                from_type: VIBECOIN_TRANSFER_TYPE.STORE,
                                to_type: VIBECOIN_TRANSFER_TYPE.USER,
                            };

                            let updateVibecoinTransfer = VibecoinTransaction.create(vibecoinTransactionObj);

                            if (updateVibecoinTransfer.length > 0) {
                                Reward.update({ is_paid: REFERRALS_MODEL.TRUE }, { where: { id: rewardData[i].id } });
                            }
                        }
                    });
                }
            }
        } catch (error) {
        }
    },

   /**
    * @description This function will unblock the user after 2 hours.
    * @return {*}
    */
    async unblockUser(req, res) {
        try {
            let userInfo = await User.findOne({
                attributes: ['id', 'status', 'email_verified_block_at'],
                where: {
                    email_verified_block_at: {
                        [Op.ne]: null
                    },
                    status: {
                        [Op.ne]: DELETE
                    }
                }
            });
            if (userInfo) {
                /* below line of code is for to check the user completed or not the block hours from the time it get blocked because of
                   maximum attempt for resend otp. */
                var blockExpiryTime = moment(userInfo.email_verified_block_at).add(USER_MODEL.VERIFY_MAX_USER_ATTEMPT_BLOCK_TIME_IN_MINUTE, 'minutes');
                const currentDateAndTime = moment().toDate();
                if (currentDateAndTime >= blockExpiryTime) {
                    User.update({ email_verified_block_at: null }, {
                        where: {
                            email_verified_block_at: {
                                [Op.ne]: null
                            }
                        },
                    });
                }
            }
        } catch (error) {
        }
    },

   /**
    * @description This function use to transfer amount to user, business and store
    * @return {*}
    */
    gasFeeTransfer: async () => {
        try {
            let sorting = [['id', ORDER_BY.ASC]];
            let gasFreeTranferInfo = await GasFeeTransfer.findAndCountAll({
                attributes: ['id', 'address'],
                where: {
                    is_read: REFERRALS_MODEL.FALSE,
                },
                order: sorting,
                limit: LIMIT,
            });

            const gasFreeTranferData = gasFreeTranferInfo.rows;
            for (let i = 0; i < gasFreeTranferData.length; i++) {
                const isWeb3Helper = new Promise((resolve, reject) => {
                    resolve(Web3Helper.transferGasFee(gasFreeTranferData[i].address));
                });
                //let isWeb3Helper = await Web3Helper.transferGasFee(gasFreeTranferData[i].address);
                isWeb3Helper.then((web3Helper) => {
                    if (web3Helper === true) {
                        GasFeeTransfer.update({ is_read: REFERRALS_MODEL.TRUE }, { where: { id: gasFreeTranferData[i].id } });
                    }
                })
            }
        } catch (error) {
        }
    }
}