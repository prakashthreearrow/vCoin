const { Op } = require('sequelize');
const Helper = require('../../services/Helper');
const { DELETE, VIBECOIN_TRANSFER_TYPE, ORDER_BY } = require('../../services/Constants');
const { User, VibecoinPurchase, Business, VibecoinTransaction, Store, Referrals, Promotion, LoyaltyCard } = require('../../models');

module.exports = {

  /* @description This function is to get Purchase Vibecoin list.
  * @param req
  * @param res
  */
  reportPurchaseVibecoin: async (req, res) => {
    try {
      let sorting = [['createdAt', ORDER_BY.DESC]];
      const vibecoinPurchaseData = await VibecoinPurchase.findAndCountAll({
        attributes: ['id', 'buyer_id', 'type', 'amount', 'transaction_id', 'vibecoin_transaction_status', 'createdAt'],
        order: sorting
      });

      const result = vibecoinPurchaseData.rows;
      var vibecoinPurchaseInfo = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].type === VIBECOIN_TRANSFER_TYPE.USER) {
          let userInfo = await User.findOne({
            attributes: ['id', 'first_name', 'last_name', 'full_name'],
            where: {
              id: result[i].buyer_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });

          if (userInfo) {
            vibecoinPurchaseInfo = [...vibecoinPurchaseInfo, {
              buyer_id: userInfo.full_name, type: result[i].type,
              amount: result[i].amount, transaction_id: result[i].transaction_id, vibecoin_transaction_status: result[i].vibecoin_transaction_status,
              createdAt: result[i].createdAt
            }];
          }

        } else {
          let businessInfo = await Business.findOne({
            attributes: ['id', 'name'],
            where: {
              id: result[i].buyer_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });

          if (businessInfo) {
            vibecoinPurchaseInfo = [...vibecoinPurchaseInfo, {
              buyer_id: businessInfo.name, type: result[i].type,
              amount: result[i].amount, transaction_id: result[i].transaction_id, vibecoin_transaction_status: result[i].vibecoin_transaction_status,
              createdAt: result[i].createdAt
            }];
          }
        }
      }
      res.render('reports/vibecoinPurchase', { data: { vibecoinPurchaseInfo }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /* @description This function is to get Transaction Vibecoin list.
 * @param req
 * @param res    
 */
  reportTransactionVibecoin: async (req, res) => {
    try {
      let sorting = [['createdAt', ORDER_BY.DESC]];
      const vibecoinTransactionData = await VibecoinTransaction.findAndCountAll({
        attributes: ['id', 'from_id', 'from_type', 'to_id', 'to_type', 'amount', 'createdAt'],
        order: sorting,
      });

      const result = vibecoinTransactionData.rows;
      var vibecoinTransactionInfo = [];
      for (let i = 0; i < result.length; i++) {
        // (1)from_type - user
        if (result[i].from_type === VIBECOIN_TRANSFER_TYPE.USER) {
          let userInfo = await User.findOne({
            attributes: ['id', 'first_name', 'last_name', 'full_name'],
            where: {
              id: result[i].from_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });

          // (1)to_type - user
          if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.USER) {
            let userData = await User.findOne({
              attributes: ['id', 'first_name', 'last_name', 'full_name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (userInfo && userData) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: userInfo.full_name, from_type: result[i].from_type,
                to_id: userData.full_name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }

            // (2)to_type - business
          } else if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
            let businessInfo = await Business.findOne({
              attributes: ['id', 'name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (userInfo && businessInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: userInfo.full_name, from_type: result[i].from_type,
                to_id: businessInfo.name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }

          } else {
            // (3)to_type - store
            let storeInfo = await Store.findOne({
              attributes: ['id', 'name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (storeInfo && userInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: userInfo.full_name, from_type: result[i].from_type,
                to_id: storeInfo.name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }

          }
          // (2)from_type - business
        } else if (result[i].from_type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
          let businessInfo = await Business.findOne({
            attributes: ['id', 'name'],
            where: {
              id: result[i].from_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });

          // (1)to_type - user
          if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.USER) {
            let userInfo = await User.findOne({
              attributes: ['id', 'first_name', 'last_name', 'full_name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (businessInfo && userInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: businessInfo.name, from_type: result[i].from_type,
                to_id: userInfo.full_name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }

          } else if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.BUSINESS) {
            // (2)to_type - business
            let businessData = await Business.findOne({
              attributes: ['id', 'name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (businessData && businessInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: businessInfo.name, from_type: result[i].from_type,
                to_id: businessData.name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }

          } else {
            // (2)to_type - store
            let storeInfo = await Store.findOne({
              attributes: ['id', 'name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (storeInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: storeInfo.name, from_type: result[i].from_type,
                to_id: storeInfo.name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }
          }
        } else {
          // (1)from_type - store
          let storeInfo = await Store.findOne({
            attributes: ['id', 'name'],
            where: {
              id: result[i].from_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });

          // (1)to_type - user
          if (result[i].to_type === VIBECOIN_TRANSFER_TYPE.USER) {
            let userInfo = await User.findOne({
              attributes: ['id', 'first_name', 'last_name', 'full_name'],
              where: {
                id: result[i].to_id,
                status: {
                  [Op.ne]: DELETE,
                }
              }
            });

            if (storeInfo && userInfo) {
              vibecoinTransactionInfo = [...vibecoinTransactionInfo, {
                from_id: storeInfo.name, from_type: result[i].from_type,
                to_id: userInfo.full_name, to_type: result[i].to_type, amount: result[i].amount, createdAt: result[i].createdAt
              }];
            }
          }
        }
      }

      res.render('reports/vibecoinTransaction', { data: { vibecoinTransactionInfo }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /* @description This function is to get referrals list.
 * @param req
 * @param res
 */
  reportReferralsVibecoin: async (req, res) => {
    try {
      let sorting = [['createdAt', ORDER_BY.DESC]];
      const vibecoinReferralsData = await Referrals.findAndCountAll({
        attributes: ['id', 'from_id', 'to_id', 'promotion_id', 'is_paid', 'type', 'createdAt'],
        order: sorting,
      });
      
      const result = vibecoinReferralsData.rows;
      var vibecoinReferralsInfo = [];
      for (let i = 0; i < result.length; i++) {
        let userFromInfo = await User.findOne({
          attributes: ['id', 'first_name', 'last_name', 'full_name'],
          where: {
            id: result[i].from_id,
            status: {
              [Op.ne]: DELETE,
            }
          }
        });

        let userToInfo = await User.findOne({
          attributes: ['id', 'first_name', 'last_name', 'full_name'],
          where: {
            id: result[i].to_id,
            status: {
              [Op.ne]: DELETE,
            }
          }
        });

        let promotionInfo = await Promotion.findOne({
          attributes: ['id', 'loyalty_card_id', 'type'],
          where: {
            id: result[i].promotion_id,
            status: {
              [Op.ne]: DELETE,
            }
          }
        });

        if (promotionInfo) {
          var loyaltyCardInfo = await LoyaltyCard.findOne({
            attributes: ['id', 'name'],
            where: {
              id: promotionInfo.loyalty_card_id,
              status: {
                [Op.ne]: DELETE,
              }
            }
          });
        }

        if (userFromInfo && userToInfo && loyaltyCardInfo && promotionInfo) {
          vibecoinReferralsInfo = [...vibecoinReferralsInfo, {
            from_id: userFromInfo.full_name, to_id: userToInfo.full_name,
            promotion_id: loyaltyCardInfo.name, promotion_type: promotionInfo.type,
            is_paid: result[i].is_paid, type: result[i].type, createdAt: result[i].createdAt
          }];
        }

      }
      res.render('reports/vibecoinReferrals', { data: { vibecoinReferralsInfo }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },
}
