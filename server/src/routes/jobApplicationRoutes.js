const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jobController = require('../controllers/jobApplicationController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/jobapplications/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });

router.post(
  '/create',
//   upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'work', maxCount: 1 }]),
  jobController.submitJobApplication
);

router.get('/getAll', jobController.getAllApplications);

module.exports = router;
