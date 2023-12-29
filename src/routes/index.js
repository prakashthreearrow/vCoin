const router = require('express').Router();
const adminRoute = require('./admin');
const appRoute = require('./api')

// Admin router
router.use('/admin', adminRoute);

// APP router
router.use('/api/v1', appRoute)

module.exports = router;
