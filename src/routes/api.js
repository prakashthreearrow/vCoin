const router = require('express').Router();
const formidableMiddleware = require('express-formidable');
const connect = require('connect');

const {
  userTokenAuth
} = require('../middlewares/user');

const {
  userRegistration,
  verifyEmail,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,

  checkSocialAccoutExist,
  createStripeAccount
} = require('../controllers/app/authController.js');

const {
  addBusiness,
  editBusiness,
  businessList,

  getUnfollowBusiness,
  followUnfollow,
  storePerformanceAnalytics
} = require('../controllers/app/businessController');

const {
  addStore,
  editStore,
  storeList,
  nearByStoreList,
  ChatFirebaseStoreFiles
} = require('../controllers/app/storeController');

const {
  promotionList,
  promotionListAsPerBusiness,
  addPromotion,
  editPromotion,

  upvotes,
  getNewsFeed,
  postList,

  savePromotionReferrals,
  promotionReferralsLink
} = require('../controllers/app/promotionController');

const {
  editUser,
  userDetail
} = require('../controllers/app/userController');

const {
  addLoyaltyCard,
  editLoyaltyCard,
  loyaltyCardList,
  loyaltyCardDiscover
} = require('../controllers/app/loyaltyCardController');

const {
  plansList,
  storePlan
} = require('../controllers/app/planController');

const {
  cardsList,
  createCard,
  removeCard,
  makeDefaultCard,
  webhook
} = require('../controllers/app/stripeController');

const {
  getBalance,
  transferVibecoin,
  purchaseVibecoin,
  vibecoinPurchaseList,
  vibecoinTransactionList,
  getRemainingPurchaseLimit
} = require('../controllers/app/accountController');

const {
  friendList,
  nonFriendList,
  pendingFriendList,
  acceptRejectFriendRequest,
  sendFriendReuest,
  cancelFriendRequest
} = require('../controllers/app/friendController');

// below two middleware function will chain the number of middleware you want to pass in routes.
const authMiddlewareWithoutFormidable = (() => {
  const chain = connect()
    ;[userTokenAuth].forEach((middleware) => {
      chain.use(middleware)
    })
  return chain
})()

const authMiddleware = (() => {
  const chain = connect()
    ;[formidableMiddleware(), userTokenAuth].forEach((middleware) => {
      chain.use(middleware)
    })
  return chain
})();

// lrf
router.post('/login', login);
router.post('/resetPassword', resetPassword);
router.post('/forgotPassword', forgotPassword);

// auth
router.post('/registration', formidableMiddleware(), userRegistration);
router.post('/verifyMail', verifyEmail);
router.post('/resendOtp', resendOtp);
router.post('/changePassword', authMiddlewareWithoutFormidable, changePassword);
router.post('/socialAccoutExist', checkSocialAccoutExist);
router.post('/create_stripe_account', authMiddleware, createStripeAccount);

// user
router.get('/user_details', authMiddleware, userDetail);
router.put('/user', authMiddleware, editUser);

// User Friends
router.get('/friends', authMiddleware, friendList);
router.get('/nonFriends', authMiddleware, nonFriendList);
router.get('/pendingFriendRequest', authMiddleware, pendingFriendList);
router.post('/acceptRejectFriendRequest', authMiddlewareWithoutFormidable, acceptRejectFriendRequest);
router.post('/sendFriendRequest', authMiddlewareWithoutFormidable, sendFriendReuest);
router.post('/cancelFriendRequest', authMiddlewareWithoutFormidable, cancelFriendRequest);

// Account
router.get('/balance', authMiddleware, getBalance);
router.get('/limit_balance', authMiddleware, getRemainingPurchaseLimit); 
router.post('/transfer_vibecoin', authMiddlewareWithoutFormidable, transferVibecoin);
router.post('/purchase_vibecoin', authMiddlewareWithoutFormidable, purchaseVibecoin);
router.get('/purchase_vibecoin', authMiddlewareWithoutFormidable, vibecoinPurchaseList);
router.get('/transfer_vibecoin', authMiddlewareWithoutFormidable, vibecoinTransactionList);

// business
router.post('/business', authMiddleware, addBusiness);
router.put('/business', authMiddleware, editBusiness);
router.get('/businesses', authMiddleware, businessList);
router.get('/notFollowedBusiness', authMiddleware, getUnfollowBusiness);
router.get('/store_performance_analytics', authMiddleware, storePerformanceAnalytics);
router.post('/follow', authMiddlewareWithoutFormidable, followUnfollow);

// store
router.post('/store', authMiddlewareWithoutFormidable, addStore);
router.put('/store', authMiddlewareWithoutFormidable, editStore);
router.get('/store', authMiddleware, storeList);
router.get('/nearByStore', authMiddleware, nearByStoreList);
router.post('/chatImage', authMiddleware, ChatFirebaseStoreFiles);

// plans
router.get('/plan', authMiddleware, plansList);
router.post('/store_subscribtion', authMiddlewareWithoutFormidable, storePlan);

// promotion
router.post('/promotions', authMiddleware, addPromotion);
router.put('/promotions', authMiddleware, editPromotion);
router.post('/savePromotionReferrals', authMiddlewareWithoutFormidable, savePromotionReferrals);
router.post('/upvotes', authMiddlewareWithoutFormidable, upvotes);
router.get('/promotionReferralsLink', authMiddleware, promotionReferralsLink);
router.get('/promotion', authMiddleware, promotionListAsPerBusiness);
router.get('/promotions', authMiddlewareWithoutFormidable, promotionList);
router.get('/newsFeed', authMiddlewareWithoutFormidable, getNewsFeed);
router.get('/posts', authMiddleware, postList);

// loyalty Card
router.post('/loyaltyCard', authMiddleware, addLoyaltyCard);
router.put('/loyaltyCard', authMiddleware, editLoyaltyCard);
router.get('/loyaltyCard', authMiddleware, loyaltyCardList);
router.get('/loyaltyCardDiscover', authMiddleware, loyaltyCardDiscover);

// stripe
router.get('/cards/:customer_id', authMiddleware, cardsList);
router.post('/cards', authMiddlewareWithoutFormidable, createCard);
router.delete('/cards', authMiddlewareWithoutFormidable, removeCard);
router.put('/cards', authMiddlewareWithoutFormidable, makeDefaultCard);

router.post('/webhooks', webhook);

module.exports = router;