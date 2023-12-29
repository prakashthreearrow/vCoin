const { s3 } = require('../config/aws');
const fs = require('fs');
const { UPLOAD_IMAGE_S3 } = require('../services/Constants');

module.exports = {
    
   /**
    * @description This function use for uploading the file in s3 bucket.
    * @param source
    * @param targetName
    * @param storagePath
    * @returns {*}
    */
    uploadImageS3: (source, targetName, storagePath, res) => {
        fs.readFile(source, function (err, filedata) {
            if (!err) {
                const putParams = {
                    ACL: `${process.env.AMZ_ACL}`,
                    Bucket: `${process.env.AMZ_BUCKET}`,
                    Key: `${storagePath}/${targetName}`,
                    Body: filedata,
                    ContentType: UPLOAD_IMAGE_S3.CONTENT_TYPE
                };
                s3.putObject(putParams, function (err, data) {
                    if (err) {
                        console.log('Could nor upload the file. Error :', err);
                    }
                    else {
                        console.log('Successfully uploaded the file', data);
                    }
                });
            }
            else {
                console.log({ 'err': err });
            }
        });
    },

   /**
    * @description This function use for deleting the file in s3 bucket.
    * @param source
    * @param targetName
    * @param storagePath
    * @returns {*}
    */
    removeOldImage: (file, storagePath, res) =>
        new Promise((resolve, reject) => {
                const params = {
                    Bucket: `${process.env.AMZ_BUCKET_URL}`,
                    Key: `${storagePath}`,
                }
                try {
                    return s3.deleteObject(params, (err, data) => {
                        if (data) {
                            console.log("data",data)
                        }
                        reject(err)
                    })
                } catch {
                    return Response.errorResponseData(
                        res,
                        res.__('somethingWentWrong'),
                        500
                    )
                }
        }),

    /**
    * @description This function use for generating image link
    * @param name
    * @returns {*}
    */
    mediaUrlForS3: (name) => {
        if (name && name !== '') {
            return `${process.env.AMZ_BUCKET_URL}/${name}`
        }
        return ''
    }
}