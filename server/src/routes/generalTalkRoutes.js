const express = require('express');
const router = express.Router();
const contactController = require('../controllers/generalTalkController');

router.post('/create', contactController.createContact);
router.get('/getAll', contactController.getAllContacts);

module.exports = router;
