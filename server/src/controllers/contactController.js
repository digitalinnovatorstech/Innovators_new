const Contact = require('../models/Contact');
const { parseRequestFiles } = require('../utils/requestedFiles');
const { uploadFiles } = require('./blogsController');

// Create new contact entry
const createContact = async (req, res) => {
  try {
    const { files, fields } = await parseRequestFiles(req);
    console.log("fileesssss", files, "fieldssssss", fields);
    const body = {};
    for (const [key, value] of Object.entries(fields)) {
      body[key] = value[0];
    }
    console.log("boooodd", body);
     if (files.document && files.document.length > 0) {
          const uploadBanner = await uploadFiles([files.document[0]]);
          body.document = uploadBanner.profileUrl;
        }
    console.log("weeeeepppppppp", body);
    
    const newContact = await Contact.create(body);
    res.status(201).json({ message: 'Contact created', data: newContact });
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error });
  }
};

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
};

module.exports = {
  createContact,
  getAllContacts,
};
