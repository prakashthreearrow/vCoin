const firebaseAdmin = require('firebase-admin')
const serviceAccount = require('./firebasepushNotification.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
})

module.exports.firebaseAdmin = firebaseAdmin
