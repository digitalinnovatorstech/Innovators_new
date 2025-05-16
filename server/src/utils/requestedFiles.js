

const formidable = require("formidable");
 
const parseRequestFiles = async (req) => {
    console.log('llllllll')
    const form = new formidable.IncomingForm();
    console.log('fffffff', form )
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {  
          if (err) {
            console.log("errrrttrreerrr",err);
          reject(err);  
        } else {
          resolve({ fields, files });
        }
      });
    });
  };
 

const parseRequestMultipleFiles = async (req) => {
    const form = new formidable.IncomingForm();
    form.multiples = true; 
    form.keepExtensions = true;

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Error parsing form data:", err);
                return reject(err);
            }

            const formattedFields = {};
            Object.keys(fields).forEach(key => {
              formattedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
            });

           
            let filesArray = [];
            if (files.imageUrl) {  
                if (Array.isArray(files.imageUrl)) {
                    filesArray = files.imageUrl; 
                } else {
                    filesArray = [files.imageUrl]; 
                }
            }


            resolve({ fields: formattedFields, files: filesArray });
        });
    });
};

 
module.exports = {parseRequestFiles, parseRequestMultipleFiles};