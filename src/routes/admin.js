const router = require('express').Router();
var multer = require("multer");
const path = require('path');
const fs = require('fs');

const {
  authCheckMiddleware,
  authPasswordMiddleware
} = require('../middlewares/admin');

const {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  index,
  dashboard,
  logout,
  getForgotPassword,
  getResetPassword,
  resendOtp,
  getChangePassword,
  editUser,
  updateUser,
  changeProfile
} = require('../controllers/admin/authController');

const {
  minterRoleList,
  mintList,
  addMint,

  addMinterRole,
  deleteMinterRole,

  vibecoinAndMaticBalance,

  mintPasswordAuthentication,
  minterRolePasswordAuthentication
} = require('../controllers/admin/accountController');

const {
  emailTemplateList,
  editEmailTemplate,
  emailDetails
} = require('../controllers/admin/emailTemplateController');

const {
  userList
} = require('../controllers/admin/userController');

const {
  subscribtionList
} = require('../controllers/admin/subscribtionController');

const { planList, addPlan, savePlan, editPlan, updatePlan,
  addPlanFeaturesToPlan, fetchPlanFeaturesByPlan } = require('../controllers/admin/planController');

const {
  vibecoinLimitList,
  vibecoinDetails,
  editVibecoinLimit
} = require('../controllers/admin/vibecoinLimitController');

const {
  reportPurchaseVibecoin,
  reportTransactionVibecoin,
  reportReferralsVibecoin
} = require('../controllers/admin/reportController');

// below function will upload image
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // below line of code will check, if folder logs not exist then it will create new one.
    const newLog = path.join(__dirname, '../../public/uploads')
    if (!fs.existsSync(newLog)) {
      fs.mkdirSync(newLog, { recursive: true }, () => { })
    }
    callback(null, './public/uploads'); // set the destination
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname); // set the file name and extension
  }
});
var upload = multer({ storage: storage });

router.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

// lrf
router.get('/login', index);
router.post('/authenticate', login);
router.get('/get_forgot_password', getForgotPassword);
router.post('/forgot_password', forgotPassword);
router.get('/reset_password/:token', getResetPassword);
router.post('/reset_password_confirm', resetPassword);

// auth
router.post('/resend_otp', resendOtp);
router.get('/change_password', authCheckMiddleware, getChangePassword);
router.post('/changePassword', authCheckMiddleware, changePassword);
router.get('/edit_profile', editUser);
router.post('/change_profile', upload.single('profile_photo'), changeProfile);
router.post('/update_profile', updateUser);

// email template
router.get('/emailTemplate', authCheckMiddleware, emailTemplateList);
router.post('/emailTemplates', authCheckMiddleware, editEmailTemplate);
router.get('/emailDetails/:id', emailDetails);

// dashboard
router.get('/dashboard', authCheckMiddleware, dashboard);
router.get('/logout', logout);

// vibecoin and matic balance
router.get('/vibecoin_matic_balance', vibecoinAndMaticBalance);

// mint
router.get('/mint-password', authCheckMiddleware, mintPasswordAuthentication);
router.get('/minter-role-password', authCheckMiddleware, minterRolePasswordAuthentication);
router.get('/mint', authCheckMiddleware, authPasswordMiddleware, mintList);
router.get('/minter-role', authCheckMiddleware, authPasswordMiddleware, minterRoleList);
router.post('/save-mint', authCheckMiddleware, addMint);
router.post('/save-minter-role', authCheckMiddleware, addMinterRole);
router.post('/delete_minter_role', authCheckMiddleware, deleteMinterRole);

// users
router.get('/user', authCheckMiddleware, userList);

// plan
router.get('/plans', authCheckMiddleware, planList);
router.get('/add_plan', authCheckMiddleware, addPlan);
router.post('/save_plan', upload.single('photo'), savePlan);
router.get('/edit_plan/:id', authCheckMiddleware, editPlan);
router.post('/update_plan', upload.single('photo'), updatePlan);

// plan features
router.post('/add_features_plan', authCheckMiddleware, addPlanFeaturesToPlan);
router.post('/fetch_features_by_plan', authCheckMiddleware, fetchPlanFeaturesByPlan);

// subcription
router.get('/subscribtions', authCheckMiddleware, subscribtionList);

// vibecoin limit
router.get('/get_vibecoin_limit', authCheckMiddleware, vibecoinLimitList);
router.post('/vibecoin_limit', authCheckMiddleware, editVibecoinLimit);
router.get('/vibecoin_limit/:id', vibecoinDetails);

// reports
router.get('/vibecoin_purchase_reports', reportPurchaseVibecoin);
router.get('/vibecoin_transaction_reports', reportTransactionVibecoin);
router.get('/vibecoin_referrals_reports', reportReferralsVibecoin);

module.exports = router;
