const Contact = require('../models/Contact');
const { parseRequestFiles } = require('../utils/requestedFiles');
const { uploadFiles } = require('./blogsController');

// Create new contact entry
const createContact = async (req, res) => {
  try {
    const { files, fields } = await parseRequestFiles(req);
    // console.log("fileesssss", files, "fieldssssss", fields);
    const body = {};
    for (const [key, value] of Object.entries(fields)) {
      body[key] = value[0];
    }
    // console.log("boooodd", body);
     if (files.document && files.document.length > 0) {
          const uploadBanner = await uploadFiles([files.document[0]]);
          body.document = uploadBanner.profileUrl;
        }
    // console.log("weeeeepppppppp", body);
    
    const newContact = await Contact.create(body);
    res.status(201).json({ message: 'Contact created', data: newContact });
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error });
  }
};


const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page-1) * limit ;
    const {count, rows: contacts} = await Contact.findAndCountAll({
      limit,
      offset,
      order:[['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error });
  }
};

const deleteContacts = async (req, res) =>{
  const {ids} = req.body;

  const idArray = Array.isArray(ids)? ids : [ids];

  const deleted = await Contact.destroy({
    where:{
      id: idArray
    }
  });

  if (deleted === 0) {
    return res.status(404).json({message: 'No Records Found To Delete'});
  };

  res.status(200).json({
    message: `Deleted ${deleted} ContactUS Successfully`,
    deletedId: idArray
  })
}

module.exports = {
  createContact,
  getAllContacts,
  deleteContacts
};
