const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./swagger');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')
const flash = require('connect-flash');

const cron = require('node-cron');
const Helper = require('./src/services/Helper');
const cronJob = require('./src/services/cronJob');
const { CRON_JOB_SET_MINUTES } = require('./src/services/Constants');

// import i18n
const i18n = require('./src/i18n/i18n');

global.__basedir = `${__dirname}/`;

// set port
const port = process.env.PORT || 9959;

// create express application
const app = express();

// parse application/json
app.use(bodyParser.json())
app.locals.siteURL = process.env.DEVELOPMENT + 'admin/'

// app configuration
app.set('view engine', 'ejs');
app.set('views', path.join(`${__dirname}/src`, 'views'));
app.use('/public/', express.static(__dirname + '/public'));

app.use(expressLayouts);
app.set("layout extractScripts", true)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(i18n);

// below line of code will check, if folder logs not exist then it will create new one.
const newLog = path.join(`${__dirname}/logs`)
if (!fs.existsSync(newLog)) {
fs.mkdirSync(newLog, { recursive: true }, () => {})
}

// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(`${__dirname}/logs`, Helper.generateLogFileName()), { flags: 'a' })
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
})

// Schedule tasks to be run on the server every five minutes.
// cron.schedule(`*/${CRON_JOB_SET_MINUTES} * * * *`, async function () {
//   await cronJob.unblockUser();
// });

// Schedule tasks to be run on the server every five minutes.
// cron.schedule(`*/${CRON_JOB_SET_MINUTES} * * * *`, async function () {
//   await cronJob.rewardsTransfer();
// });

// Schedule tasks to be run on the server every five minutes.
// cron.schedule(`*/${CRON_JOB_SET_MINUTES} * * * *`, async function () {
//   await cronJob.gasFeeTransfer();
// });

app.use(session({

  secret: 'vibecoin w3',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 36000000 }

}));

app.use(function (req, res, next) {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate, private"); // HTTP 1.1.
  res.set("Pragma", "no-cache");
  res.set("Expires", "0"); // HTTP 1.0.
  next()

});

// import routes
const indexRoute = require('./src/routes');

app.use(flash());
app.use(bodyParser.json({ limit: 10 * 1024 * 1024 }));
app.use(bodyParser.raw({ limit: 10 * 1024 * 1024 }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', indexRoute);

app.all('*', function (req, res, next) {                // for handling unknown routes..
  if (!req.session.token) {
    res.redirect("/admin/login");
  } else {
    res.redirect("/admin/dashboard");
  }
});

app.listen(port, (req,) => {
  console.log(`Server listening to port ${port}`);
});
