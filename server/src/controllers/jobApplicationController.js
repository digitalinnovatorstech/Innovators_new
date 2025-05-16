const JobApplication = require('../models/JobApplication');
const { parseRequestFiles } = require('../utils/requestedFiles');
const { uploadFiles } = require('./blogsController');

const submitJobApplication = async (req, res) => {
  try {
    console.log("rttttttttttttt");
    
    const { files, fields } = await parseRequestFiles(req);
    console.log("fileesssss", files, "fieldssssss", fields);
    const body = {};
    for (const [key, value] of Object.entries(fields)) {
      body[key] = value[0];
    }
    console.log("boooodd", body, "lengthhhhh", files.length);
     if (files && Object.keys(files).length > 0) {
        console.log('filessssssifffff', files)
        if (files.resume && files.resume.length > 0) {
            console.log('resumeeee', files.resume)
            const uploadBanner = await uploadFiles([files.resume[0]]);
            body.resume = uploadBanner.profileUrl;
          }
        if (files.work && files.work.length > 0) {
            console.log('worrrrkkkkkkk', files.work)
            const uploadBanner = await uploadFiles([files.work[0]]);
            body.work = uploadBanner.profileUrl;
          }
          console.log("weeeeepppppppp", body);
     }

    const resume = req.files?.resume?.[0]?.filename || null;
    const work = req.files?.work?.[0]?.filename || null;

    const application = await JobApplication.create(body);

    res.status(201).json({ message: 'Application submitted successfully', data: application });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.findAll();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

module.exports = {
  submitJobApplication,
  getAllApplications,
};
