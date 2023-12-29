module.exports = {
    ENVIRONMENT_VARIABLE: {
        DEVELOPMENT: 'development'
    },
    SUBSCRIPTION_USER_AS_PLURAL: 'You',
    EMAIL_TEMPLATE_TYPE: {
        FORGET_PASSWORD: 'forgot_password',
        OTP_VERIFY: 'otp_verify',
        RESEND_OTP: 'resend_otp',
        SUBSCRIPTION_BUY: 'subscription_buy',
        SUBSCRIPTION_RENEW: 'subscription_renew',
        VIBECOIN_SENDER: 'vibecoin_sender',
        VIBECOIN_RECEIVER: 'vibecoin_receiver'
    },
    PLAN_FEATURES: {
        VIBECOIN_TRANSACTION: 'Vibecoin Transaction',
        LAND_NFT: 'Land NFT',
        PHOTO: 'Photo',
        PROMOTIONS: 'Promotions',
        UNLIMITED_MESSAGES: 'Unlimited Messages',
        CUSTOMER_LOYALTY_CARD: 'Customer Loyalty Card',
        ANALYTICS: 'Analytics',
        ENTERPRICE_ADMINISTRATION: 'Enterprise Administration',
        SUPPORT: '24/7 Support',
        DESIGNATED_CUSTOMER_SUCCESS_TEAM: 'Designated Customer Success Team'
    },
    PLAN_TYPE: {
        FREE: 1,
        PAID: 2,
        PLAN_TYPE_PAID: {
            PREMIUM: 'Premium',
            ENTERPRICE: 'Enterprice'
        },
        PREMIUM_LIMIT: 100,
        ACCESS_TYPE: {
            YES: 1,
            NO: 2,
            LIMITED: 3,
            UNLIMITED: 4
        }
    },
    VIBECOIN: {
        MINT: 'mint',
        MINT_ROLE: 'minter-role',
    },
    DEVICE_TYPE: {
        ANDROID: 1,
        IPHONE: 2,
        DESKTOP: 3
    },
    DEVICE_TYPE_USER: {
        ANDROID: '1',
        IPHONE: '2',
    },
    SUBSCRIPTION_TYPE_BY: {
        LOYALTYCARD: 'loyaltycard',
        STORE: 'store'
    },
    UPLOAD_IMAGE_S3: {
        CONTENT_TYPE: 'image/png,image/jpeg',
    },
    FILE_MINETYPE: {
        PNG: 'image/png',
        JPEG: 'image/jpeg',
        JPG: 'image/jpg'
    },
    VIEW_ENGINE_EXTENSION: 'ejs',
    EMAILS_VIEW_PATH: 'src/views/common',
    FOLLOW: {
        TRUE: 'true',
        FALSE: 'false',
    },
    CURRENCY: {
        USD: 'usd'
    },
    ORDER_BY: {
        ASC: 'ASC',
        DESC: 'DESC'
    },
    IMAGE_STORAGE_PATH: 'public/uploads',
    LOGS_STORAGE_PATH: 'logs',
    STREAM_FLAGS: {
        WRITE: 'w',
    },
    SUCCESS: 1,
    FAIL: 2,
    ACTIVE: 1,
    INACTIVE: 2,
    DELETE: 3,
    LIMIT: 10,
    TRUE: 'true',
    FALSE: 'false',
    GEOGRAPHICAL_DISTANCE: 2500,
    CRON_JOB_SET_MINUTES: 1,
    RANDOM_DIGIT: '0123456789',
    RANDOM_ALPHANUMERICS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    IMAGE_SIZE: 10000000, // 10 mb
    CHAT_IMAGE: 'chat',
    ADDRESS_TYPE: {
        ADMIN_ADDRESS: 'admin',
        PURCHASE_ADDRESS: 'purchase'
    },
    ADMIN_MODEL: {
        EMAIL: 'vibecoin@mailinator.com',
        PASSWORD: 'Vibecoin@123'
    },
    USER_MODEL: {
        NUM_OF_DIGIT_OTP: 4,
        OTP_EXPIRY_IN_MINUTE: 20,
        TYPE: {
            ADMIN_TYPE: 1,
            USER_TYPE: 2
        },
        PROFILE_PHOTO: 'user/image',
        EMAIL_VERIFY_OTP_EXPIRY_MINUTE: 10,
        VERIFY_MAX_USER_ATTEMPT_BLOCK_TIME_IN_MINUTE: 120,
        MAX_USER_VERIFY_ATTEMPT: 5,
        LOGIN_TYPE: {
            NORMAL: "1",
            GOOGLE: "2",
            FACEBOOK: "3",
            APPLE: "4"
        },
        OTP_TYPE: {
            OTP_VERIFY: 1,
            RESET_PASSWORD_VERIFY: 2,
        }
    },
    STORE_MODEL: {
        YES: 1,
        NO: 2
    },
    PROMOTION_MODEL: {
        TYPE: {
            DISCOUNT: "1",
            PROMOTION: "2",
            PAID_REFERRALS: "3",
            CASH_BACK: "4"
        },
        PHOTO: 'promotion/image'
    },
    BUSINESS_MODEL: {
        PHOTO: 'business/image',
        ANALYTICS_LAST_DAYS: 7
    },
    LOYALTY_CARD_MODEL: {
        IMAGE: 'loyaltyCard/image'
    },
    PLAN_MODEL: {
        PHOTO: 'plan/image',
        PLAN_TYPE: {
            1: 'Free',
            2: 'Paid'
        },
        SUBSCRIPTION_TYPE: {
            1: 'MONTHLY',
            2: 'QUATERLY',
            3: 'YEARLY'
        },
        ACCESS_TYPE: {
            1: 'Yes',
            2: 'No',
            3: 'Limited',
            4: 'Unlimited'
        }
    },
    STRIPE_MODEL: {
        WEBHOOK: 'weebhookResponse: ',
        WEBHOOK_TYPE: {
            INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
            INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded'
        },
    },
    USER_FRIENDS_MODEL: {
        FRIEND_REQ: {
            SENT: 'sent',
            RECEIVED: 'received'
        },
        STATUS_TYPE: {
            PENDING: 1,
            ACCEPTED: 2,
            REJECTED: 3
        }
    },
    CRYPTO: {
        AMOUNT_PRECISE: 1000000000000000000,
        WEB3_ENCRYPT: {
            RANDOM_KEY: 'K2s7D35hR95Yxq7P'
        },
        CRYPTO_OPTIONS: {
            ALGORITHM: 'aes256',
            RANDOM_KEY: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            ENCODE: 'utf8',
            DIGEST: 'hex'
        }
    },
    VIBECOIN_LIMIT: {
        TYPE: {
            ADMIN_TO_USER: 1,
            ADMIN_TO_BUSINESS: 2,
            USER_TO_USER: 3,
            USER_TO_BUSINESS: 4,
            USER_TO_STORE: 5,
            BUSINESS_TO_USER: 6,
            BUSINESS_TO_STORE: 7,
            STORE_TO_USER: 8
        },
        DURATION: {
            DAY: 1,
            HOUR: 2,
            MINUTE: 3
        },
        DURATION_OPTION: [
            { NAME: 'DAY', VALUE: 1 },
            { NAME: 'HOUR', VALUE: 2 },
            { NAME: 'MINUTE', VALUE: 3 }
        ]
    },
    VIBECOIN_TRANSFER_TYPE: {
        USER: 1,
        BUSINESS: 2,
        STORE: 3
    },
    REFERRALS_MODEL: {
        TYPE: {
            REFERRALS: 1,
            UPVOTES: 2
        },
        TRUE: true,
        FALSE: false
    },
}