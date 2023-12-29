require('dotenv').config();
const AWS = require('aws-sdk');
let awsCredential= {
  accessKeyId: `${process.env.AMZ_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AMZ_SECRET_ACCESS_KEY}`,
  region: `${process.env.AMZ_REGION}`,
}

AWS.config.update(awsCredential)
module.exports = { 
  s3: new AWS.S3(),
  ssm: new AWS.SSM(),
}
