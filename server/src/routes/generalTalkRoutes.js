const express = require('express');
const router = express.Router();
const contactController = require('../controllers/generalTalkController');

router.post('/create', contactController.createContact);
router.get('/getAll', contactController.getAllContacts);
router.delete('/delete', contactController.deleteContacts);

module.exports = router;
