const {
  mintValidation,
  deleteMintValidation,
  minterRoleValidation
} = require('../../services/AdminValidation');
const {
  mintVibecoin,
  addMinterRole,
  revokeMinterRole,
  getBalance,
  getMaticBalance
} = require('../../services/Web3Helper');
const { walletAddressKey } = require('../../config/web3');
const { ACTIVE, DELETE, ORDER_BY, ADDRESS_TYPE } = require('../../services/Constants');
const { VibecoinMint, VibecoinMinterRole } = require('../../models');
const Helper = require('../../services/Helper');
const Response = require('../../services/Response');
const { StatusCodes } = require('http-status-codes');

module.exports = {

  /**
     * @description This function is to re-direct mint password authentication.
     * @param req
     * @param res
     */
  mintPasswordAuthentication: async (req, res) => {
    try {
      req.session.passwordAuthenticateKey = process.env.PASSWORD_AUTHENTICATE_KEY;
      res.render('passwordAuthentication/password', { message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
   * @description This function is to re-direct mint password authentication.
   * @param req
   * @param res
   */
  minterRolePasswordAuthentication: async (req, res) => {
    try {
      req.session.passwordAuthenticateKey = process.env.PASSWORD_AUTHENTICATE_KEY;
      res.render('passwordAuthentication/minter-role-password', { message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
     * @description This function is to get mint list.
     * @param req
     * @param res
     */
  mintList: async (req, res) => {
    try {
      req.session.passwordAuthenticateKey = null;
      let sorting = [['createdAt', ORDER_BY.DESC]];
      const mintInfo = await VibecoinMint.findAndCountAll({
        attributes: ['id', 'address', 'amount', 'createdAt'],
        order: sorting,
        distinct: true
      });
      const result = mintInfo.rows;
      res.render('mint', { data: { result }, Helper: Helper, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
  * @description This function is to add mint.
  */
  addMint: async (req, res) => {
    try {
      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // Below function will validate all the fields which we were passing from the body.
      const validate = mintValidation(requestParams, res);
      if (!validate.status) {
        req.session.passwordAuthenticateKey = process.env.PASSWORD_AUTHENTICATE_KEY;
        req.flash('errorMessage', validate.message);
        res.redirect('mint');
      }
      if (validate.status === true) {
        let isMintSuccess = await mintVibecoin(requestParams.address, requestParams.amount);

        if (isMintSuccess === true) {
          const MintObj = {
            address: requestParams.address,
            amount: requestParams.amount,
            created_ip: SYSTEM_IP
          };
          let mintInfo = await VibecoinMint.create(MintObj);
          if (mintInfo) {
            req.session.passwordAuthenticateKey = process.env.PASSWORD_AUTHENTICATE_KEY;
            req.flash('successMessage', res.locals.__('addMintAddressSuccess'));
            res.redirect('mint');
          }
        }
      }
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect("mint");
    }
  },

  /**
    * @description This function is to get mint list.
    * @param req
    * @param res
    */
  minterRoleList: async (req, res) => {
    try {
      req.session.passwordAuthenticateKey = null;
      let sorting = [['createdAt', ORDER_BY.DESC]];
      const minterRoleInfo = await VibecoinMinterRole.findAndCountAll({
        attributes: ['id', 'address'],
        where: {
          status: ACTIVE,
        },
        order: sorting,
        distinct: true
      });
      const result = minterRoleInfo.rows;
      res.render('minterRole', { data: { result }, message: req.flash('errorMessage'), messages: req.flash('successMessage') });
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
* @description This function is to add minter role.
*/
  addMinterRole: async (req, res) => {
    try {

      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // Below function will validate all the fields which we were passing from the body.
      const validate = minterRoleValidation(requestParams, res);

      if (!validate.status) {
        req.flash('errorMessage', validate.message);
        res.redirect('minter-role');
      }
      if (validate.status === true) {

        let isMinterRole = await addMinterRole(requestParams.address);

        if (isMinterRole === true) {

          const MinterRoleObj = {
            address: requestParams.address,
            status: ACTIVE,
            created_ip: SYSTEM_IP
          };
          let minterRoleInfo = await VibecoinMinterRole.create(MinterRoleObj);
          if (minterRoleInfo) {
            req.session.passwordAuthenticateKey = process.env.PASSWORD_AUTHENTICATE_KEY;
            req.flash('successMessage', res.locals.__('addMinterRoleAddressSuccess'));
            res.redirect('minter-role');
          }
        } else {
          req.flash('errorMessage', res.locals.__('noAddressFound'));
          res.redirect('minter-role');
        }
      }
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
  * @description This function is to delete mint.
  */
  deleteMinterRole: async (req, res) => {
    try {
      const requestParams = req.body;
      const SYSTEM_IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // Below function will validate all the fields which we were passing from the body.
      const validate = deleteMintValidation(requestParams, res);

      if (!validate.status) {
        req.flash('errorMessage', validate.message);
        res.redirect('minter-role');
      }
      if (validate.status === true) {

        let isAddress = await revokeMinterRole(requestParams.address);
        if (isAddress === true) {
          let minterRoleUpdate = await VibecoinMinterRole.update({ status: DELETE, updated_ip: SYSTEM_IP }, {
            where: { id: requestParams.id },
          });
          if (minterRoleUpdate) {
            req.flash('successMessage', res.locals.__('deleteAddressSuccess'))
            res.redirect('minter-role');
          }
        } else {
          req.flash('errorMessage', res.locals.__('noAddressFound'));
          res.redirect('minter-role');

        }
      }
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  },

  /**
* @description This function is to get vibecoin and matic balance.
* @param req
* @param res
*/
  vibecoinAndMaticBalance: async (req, res) => {
    try {
      const requestParams = req.query;
      if (requestParams.address_type === ADDRESS_TYPE.ADMIN_ADDRESS) {
        var adminAddress = await Helper.getKey(walletAddressKey);
        var admin_vibecoin = await getBalance(adminAddress);
        var admin_matic = await getMaticBalance(adminAddress);
      } else if (requestParams.address_type === ADDRESS_TYPE.PURCHASE_ADDRESS) {
        var purchaseAddress = await Helper.getKey(process.env.PURCHASE_WALLET_ADDRESS_DEVELPMENT);
        var purchase_vibecoin = await getBalance(purchaseAddress);
        var purchase_matic = await getMaticBalance(purchaseAddress);
      }

      let balance = {
        admin_vibecoin: admin_vibecoin,
        admin_matic: admin_matic,
        admin_address: adminAddress,
        purchase_vibecoin: purchase_vibecoin,
        purchase_matic: purchase_matic,
        purchase_address: purchaseAddress,
      }
      if (balance) {
        return Response.successResponseData(res, balance, StatusCodes.OK, res.__('success'));
      }
    } catch (error) {
      req.flash('errorMessage', res.locals.__('internalError'));
      res.redirect('dashboard');
    }
  }
}
