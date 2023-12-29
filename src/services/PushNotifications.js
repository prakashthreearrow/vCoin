const { firebaseAdmin } = require('../config/firebase')

module.exports = {
    pushNotification: async (notification, firebaseToken) => {
        const token = firebaseToken;
        if (token.length > 0) {
            var payload = {
                notification: {
                    title: notification.title,
                    body: notification.body
                }
            };

            await firebaseAdmin.messaging().sendToDevice(firebaseToken, payload)
                .then(function (response) {
                    console.log("Successfully sent message:", response);
                    console.log(response.results[0].error);
                })
                .catch(function (error) {
                    console.log("Error sending message:", error);
                });
        }
    },
}