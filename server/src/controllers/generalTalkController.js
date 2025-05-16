const Generaltalk = require('../models/generalTalk');

const createContact = async (req, res) => {
  try {
    console.log('kkdidodod', req.body);
    const contact = await Generaltalk.create(req.body);
    res.status(201).json({ message: 'Contact created successfully', data: contact });
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Generaltalk.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

module.exports = {
  createContact,
  getAllContacts
};
