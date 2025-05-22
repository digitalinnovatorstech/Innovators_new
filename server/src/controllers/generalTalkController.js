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
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page-1) * limit;
    
    const {count, rows: contacts} = await Generaltalk.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })
    // const contacts = await Generaltalk.findAll();
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};

const deleteContacts = async (req, res) =>{
  try {
    const {ids} = req.body;
    const idArray = Array.isArray(ids) ? ids : [ids];

    const deleted = await Generaltalk.destroy({
      where:{
        id: idArray
      }
    });
    if (deleted === 0 ) {
      return res.status(404).json({message: 'No GeneralTalk found to delete'});
    }

    res.status(200).json({
      message: `Deleted ${deleted} GeneralTalks successfully`,
      deletedIds: idArray
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error While Deleting GeneralTalks',
      error: error.message
    })
  }
}

module.exports = {
  createContact,
  getAllContacts,
  deleteContacts
};
