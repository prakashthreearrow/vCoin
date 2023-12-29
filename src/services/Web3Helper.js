const { web3Instance, wibInstance, tokenAddress, walletAddressKey, walletPrivateKey } = require('../config/web3');
const Helper = require('../services/Helper');
const { CRYPTO } = require('../services/Constants');

module.exports = {
    amountPrecise: 1000000000000000000,
    gaslimit: 210000,
    web3Encrypt: {
        randomKey: CRYPTO.WEB3_ENCRYPT.RANDOM_KEY,
    },

   /** 
    * @description This function use to create account..
    * @param userId
    * @param email
    * @return {*}
    */
    createAccount: async (userId = '', email = '') => {
        try {
            if (userId === '' || email === '') {
                return false;
            }
            let password = module.exports.generatePassword(userId, email);
            let account = web3Instance.eth.accounts.create();
            if (typeof account !== 'undefined') {
                account.encryptKeyJson = web3Instance.eth.accounts.encrypt(account.privateKey, password);
                account.encryptKey = await Helper.encryptData(JSON.stringify(account.encryptKeyJson));
                return account;
            }
            return false;
        } catch (error) {
            console.log("error", error)
        }
    },

   /** 
    * @description This function use to generate password for hash private key of account..
    * @param userId
    * @param email
    * @return string
    */
    generatePassword: (userId = '', email = '') => {
        if (userId === '' || email === '') {
            return false;
        }
        return `${module.exports.web3Encrypt.randomKey}-${userId}-${email}`;
    },

   /** 
    * @description This function use to get balance of contract account..
    * @param address
    * @return string
    */
    getBalance: async (address = null) => {
        if (address === '' || address === null) {
            return null;
        }

        let balance = 0;

        await wibInstance.methods.balanceOf(address).call().then(function (result) {
            balance = result;
        });

        return balance / module.exports.amountPrecise;
    },

   /** 
    * @description This function use to get matic balance of contract account..
    * @param address
    * @return string
    */
    getMaticBalance: async (address = null) => {
        if (address === '' || address === null) {
            return null;
        }
        let gasBalance = await web3Instance.eth.getBalance(address);
        gasBalance = gasBalance ? gasBalance / module.exports.amountPrecise : 0;
        return gasBalance;
    },

   /** 
    * @description This function use to get estimated gas.
    * @param address
    * @return string
    */
    getEstimatedGas: async (toAddress = null) => {
        if (toAddress === null) {
            return null;
        }
        // To Do : get current required estimated gas
        let gasFee = module.exports.gaslimit //await web3Instance.eth.getGasPrice();
        module.exports.transferGasFee(toAddress, gasFee)
    },

   /** 
    * @description This function use to mint account..
    * @param address
    * @return string
    */
    transferGasFee: async (toAddress = null) => {

        let fromAddress = await Helper.getKey(walletAddressKey);
        let encryptedKey = await Helper.getKey(walletPrivateKey);

        if (fromAddress === '' || encryptedKey === '' || toAddress === null) {
            return false;
        }

        // let decryptKey = await Helper.decryptData(encryptedKey);
        // let password = module.exports.generatePassword(userId, email);
        // let privateJson = web3Instance.eth.accounts.decrypt(decryptKey, password);
        let privateKey = encryptedKey; //privateJson.privateKey;

        if (!privateKey) {
            return false;
        }
        let vibecoinAmount = web3Instance.utils.toHex(process.env.GAS_LIMIT_BALANCE)

        let rawTransaction = {
            'from': fromAddress,
            'to': toAddress,
            'value': vibecoinAmount,
            'gasLimit': web3Instance.utils.toHex(module.exports.gaslimit),
        }

        const signedTx = await web3Instance.eth.accounts.signTransaction(rawTransaction, privateKey);
        let transaction = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);

        return transaction.status;
    },

   /** 
    * @description This function use to transfer vibecoin.
    * @param address
    * @return string
    */
    transaction: async (isPurchase = false, toAddress = null, amount = null, userId = null, email = null, fromAddress = null, encryptedKey = null) => {
        
        if (isPurchase) {
            fromAddress = await Helper.getKey(process.env.PURCHASE_WALLET_ADDRESS_DEVELPMENT);
            encryptedKey = await Helper.getKey(process.env.PURCHASE_WALLET_PRIVATE_DEVELPMENT);
        }
      
        if (fromAddress === null || encryptedKey === null || toAddress === null) {
            return false;
        }
        
        let privateKey = encryptedKey;
        if (!isPurchase) {
            let decryptKey = await Helper.decryptData(encryptedKey);
            let password = module.exports.generatePassword(userId, email);
            let privateJson = web3Instance.eth.accounts.decrypt(decryptKey, password);
            privateKey = privateJson.privateKey;
        }

        if (!privateKey) {
            return false;
        }

        let vibecoinAmount = web3Instance.utils.toHex(amount * module.exports.amountPrecise);
    
        let count = await web3Instance.eth.getTransactionCount(fromAddress);
      
        let rawTransaction = {
            'from': fromAddress,
            // 'gasPrice': web3Instance.utils.toHex(20 * 1e9),
            'gasLimit': web3Instance.utils.toHex(module.exports.gaslimit),
            'to': tokenAddress,
            'value': 0x0,
            'data': wibInstance.methods.transfer(toAddress, vibecoinAmount).encodeABI(),
            'nonce': web3Instance.utils.toHex(count)
        }
        const signedTx = await web3Instance.eth.accounts.signTransaction(rawTransaction, privateKey);
        let transaction = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        fromAddress = null;
        privateKey = null;
        return transaction.status;
    },

   /** 
    * @description This function use to mint account..
    * @param address
    * @return string
    */
    mintVibecoin: async (address = null, amount = null) => {
        try {
            let fromAddress = await Helper.getKey(walletAddressKey);
            let encryptedKey = await Helper.getKey(walletPrivateKey);

            if (fromAddress === '' || encryptedKey === '' || address === null) {
                return false;
            }

            // let decryptKey = await Helper.decryptData(encryptedKey);
            // let password = module.exports.generatePassword(userId, email);
            // let privateJson = web3Instance.eth.accounts.decrypt(decryptKey, password);
            let privateKey = encryptedKey; //privateJson.privateKey;

            if (!privateKey) {
                return false;
            }

            let vibecoinAmount = web3Instance.utils.toHex(amount * module.exports.amountPrecise)

            let count = await web3Instance.eth.getTransactionCount(fromAddress)
            let rawTransaction = {
                'from': fromAddress,
                // 'gasPrice': web3Instance.utils.toHex(20 * 1e9),
                'gasLimit': web3Instance.utils.toHex(module.exports.gaslimit),
                'to': tokenAddress,
                'value': 0x0,
                'data': wibInstance.methods.mint(address, vibecoinAmount).encodeABI(),
                'nonce': web3Instance.utils.toHex(count)
            }
            const signedTx = await web3Instance.eth.accounts.signTransaction(rawTransaction, privateKey);
            let transaction = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);

            fromAddress = null;
            privateKey = null;
            return transaction.status
        } catch (error) {
            console.log("error", error)
        }

    },

   /** 
    * @description This function use to add minter role..
    * @param address
    * @return boolean
    */
    addMinterRole: async (address = null) => {
        let fromAddress = await Helper.getKey(walletAddressKey);
        let encryptedKey = await Helper.getKey(walletPrivateKey);

        if (fromAddress === '' || encryptedKey === '' || address === null) {
            return false;
        }

        // let decryptKey = await Helper.decryptData(encryptedKey);
        // let password = module.exports.generatePassword(userId, email);
        // let privateJson = web3Instance.eth.accounts.decrypt(decryptKey, password);
        let privateKey = encryptedKey; //privateJson.privateKey;

        if (!privateKey) {
            return false;
        }

        let count = await web3Instance.eth.getTransactionCount(fromAddress);

        let rawTransaction = {
            'from': fromAddress,
            'gasLimit': web3Instance.utils.toHex(module.exports.gaslimit),
            'to': tokenAddress,
            'value': 0x0,
            'data': wibInstance.methods.grantRole(process.env.ROLE_KEY, address).encodeABI(),
            'nonce': web3Instance.utils.toHex(count)
        }
        const signedTx = await web3Instance.eth.accounts.signTransaction(rawTransaction, privateKey);
        let transaction = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        fromAddress = null;
        privateKey = null;
        return transaction.status
    },

   /** 
    * @description This function use to revoke minter role..
    * @param address
    * @return boolean
    */
    revokeMinterRole: async (address = null) => {
        let fromAddress = await Helper.getKey(walletAddressKey);
        let encryptedKey = await Helper.getKey(walletPrivateKey);

        if (fromAddress === '' || encryptedKey === '' || address === null) {
            return false;
        }

        // let decryptKey = await Helper.decryptData(encryptedKey);
        // let password = module.exports.generatePassword(userId, email);
        // let privateJson = web3Instance.eth.accounts.decrypt(decryptKey, password);
        let privateKey = encryptedKey; //privateJson.privateKey;

        if (!privateKey) {
            return false;
        }

        let count = await web3Instance.eth.getTransactionCount(fromAddress)
        let rawTransaction = {
            'from': fromAddress,
            'gasLimit': web3Instance.utils.toHex(module.exports.gaslimit),
            'to': tokenAddress,
            'value': 0x0,
            'data': wibInstance.methods.revokeRole(process.env.ROLE_KEY, address).encodeABI(),
            'nonce': web3Instance.utils.toHex(count)
        }
        const signedTx = await web3Instance.eth.accounts.signTransaction(rawTransaction, privateKey);
        let transaction = await web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
        fromAddress = null;
        privateKey = null;
        return transaction.status;
    },
}