const express = require('express');
const router = express.Router();
const { createContact, getAllContacts } = require('../controllers/contactController');

router.post('/create', createContact);
router.get('/getAll', getAllContacts);

module.exports = router;
