const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();
 

 
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, 
});
 
 
 
 
const uploadFile = async (files, Allowed_types) => {
  try {
    console.log('fileeess Allowed', files, Allowed_types)
    if (Allowed_types.includes(files.mimetype)) {
      let data = fs.readFileSync(files.filepath);
 
      let uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${files.filepath}/${files.originalFilename}`,
        Body: data,
      };
 
      return new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
          if (err) {
            resolve({ success: false, message: "File upload error" });
          }
          if (data) {
            resolve({ success: true, url: data.Location });
          }
        });
      });
    } else {
      return { success: false, message: "Please check file type" };
    }
  } catch (error) {
    console.log('Something went wrong.', error);
  }
 
}
 
 
module.exports = uploadFile;