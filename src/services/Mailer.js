var nodemailer = require('nodemailer');
var Email = require('email-templates');
const { StatusCodes } = require('http-status-codes');
const Helpers = require('./Helper');
const Response = require('./Response');
const { VIEW_ENGINE_EXTENSION, EMAILS_VIEW_PATH, TRUE } = require('../services/Constants');

module.exports = {
   /**
    * @description "This function is used to send the mail."
    * @param toEmail
    * @param mailSubject
    * @param templateName
    * @param locale
    */
    sendMail: async (toEmail, mailSubject, templateName, locale) => {
        if (process.env.SEND_EMAIL === TRUE) {
            const configOption = {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            };

            const viewPath = EMAILS_VIEW_PATH;
            const transporter = nodemailer.createTransport(configOption);
            const email = new Email({
                transport: transporter,
                send: true,
                preview: false,
                views: {
                    options: {
                        extension: VIEW_ENGINE_EXTENSION
                    },
                    root: viewPath
                }
            });
            // send mail with defined transport object
            const info = await email.send({
                template: templateName,
                message: {
                    from: `${Helpers.AppName} <${process.env.COMPANY_EMAIL}>`,
                    to: toEmail,
                    subject: mailSubject,

                },
                locals: locale
            });
            if (info) {
                console.log('Message sent: %s', info.messageId);
            }
            return info;
        } else {
            return true;
        }
    }
};
