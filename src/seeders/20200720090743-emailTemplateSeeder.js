const { ACTIVE } = require('../services/Constants');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('email_template', [
      {
        type: 'forgot_password',
        title: 'Forgot Password',
        subject: 'Forgot Password',
        format: `<h3 style="font-family: sans-serif; font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 20px; color: #5a443d;">Hello %FIRST_NAME%,</h3>
        <p style="font-family: sans-serif; font-size: 14px; margin-top: 0; margin-bottom: 20px; color: #5a443d; font-weight: 400; line-height: 1.5em;">It looks like you forgot your password and want to generate a new one. No need to worry, Please use the below OTP to reset the password!</p>
        <h3 style="font-family: sans-serif; font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 20px; color: #5a443d;">Your OTP is: %OTP%</h3>
        <h3 style="font-family: sans-serif; font-size: 14px; font-weight: bold; margin-bottom: 0; margin-top: 20px; color: #5a443d;">Thank you</h3>
        <p style="font-family: sans-serif; font-size: 14px; margin-top: 0; margin-bottom: 20px; color: #5a443d; font-weight: 400; line-height: 1.5em;">Team %appName%</p>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'otp_verify',
        title: 'OTP Verify',
        subject: 'OTP Verify',
        format: `<td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
            Hello %FIRST_NAME%,</h3>
        <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
            Please verify by entering the OTP!</p>
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
            <p
                style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
            </p> Confirmation Code: %OTP%
        </h3>
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
            Thank you</h3>
        <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
            Team %appName% </p>
    </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'resend_otp',
        title: 'Resend OTP',
        subject: 'Resend OTP',
        format: `<td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
            Hello %FIRST_NAME%,</h3>
        <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
            Please verify by entering the OTP!</p>
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
            <p
                style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
            </p> Confirmation Code: %OTP%
        </h3>
        <h3
            style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
            Thank you</h3>
        <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
            Team %appName% </p>
    </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'subscription_buy',
        title: 'Subscription Buy',
        subject: 'Subscription Buy',
        format: ` <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          Hello %admin_name% %user_name%,</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
         %You% have successfully subscribed for %store_name%! on price %price% for %subscription_type% on business %business_name%</p>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
          </p> Subscription starts from : %subscription_start_date%
        </h3>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
          </p> Next subscription payment due on :%subscription_end_date%
        </h3>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
          Thank you</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
          Team %appName% </p>
      </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'subscription_renew',
        title: 'Subscription Renew',
        subject: 'Subscription Renew',
        format: ` <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          Hello %admin_name% %user_name%,</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
          %You% have successfully subscribed for this %store_name%! at %price% for %subscription_type% in %business_name%</p>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
          </p> Subscription starts from : %subscription_start_date%
        </h3>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          <p
            style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #4f0809; font-weight: bold; line-height: 1.5em;">
          </p> Next subscription payment due on :%subscription_end_date%
        </h3>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
          Thank you</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
          Team %appName% </p>
      </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'vibecoin_sender',
        title: 'Vibecoin Purchase',
        subject: 'Vibecoin Purchase',
        format: ` <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          Hello %admin_name%,</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
         %You% have successfully sent %vibecoin_coin% vibecoin %user_detail%</p>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
          Thank you</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
          Team %appName% </p>
      </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: 'vibecoin_receiver',
        title: 'Vibecoin Received',
        subject: 'Vibecoin Received',
        format: ` <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 8px; margin-top: 20px; color: #006a4e;">
          Hello %user_name%,</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
         %You% have successfully received %vibecoin_coin% vibecoin %user_detail%</p>
        <h3
          style="font-family: sans-serif; font-size: 14px; font-weight: bold; Margin-bottom: 0; margin-top: 20px; color: #006a4e;">
          Thank you</h3>
        <p
          style="font-family: sans-serif; font-size: 14px; Margin-top: 0; Margin-bottom: 20px; color: #006a4e; font-weight: 400; line-height: 1.5em;">
          Team %appName% </p>
      </td>`,
        status: ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('email_template', null, {});
  },
}
