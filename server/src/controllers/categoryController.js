const Blog = require("../models/blogs");
const Career = require("../models/careers");
const Category = require("../models/categories");

const createCategory = async (req, res) => {
  try {
    const type = req.query.type;
    console.log('typeee', type);
    const data = req.body;
    data.type = type;
    console.log('dataaaa', data);
    const newCategory = await Category.create(data);
    res.status(201).json({success: true, data: newCategory});
  } catch (error) {
    res.status(500).json({ error: "Error creating category" });
  }
};

// const getCategories = async (req, res) => {
//   try {
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     const offset = (page - 1) * limit;

//     const { count, rows: categories } = await Category.findAndCountAll({
//       limit,
//       offset,
//     });

//     res.json({
//       totalItems: count,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//       data: categories,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching categories" });
//   }
// };


const getCategories = async (req, res) => {
    try {
        const type = req.query.type
      const categories  = await Category.findAndCountAll({where:{type: type}});
        
      res.json({ success: true, message: "Data fetched successfully",
        data: categories,
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching categories" });
    }
  };

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryData = await Category.findOne({id});
    if (!categoryData) return res.status(404).json({ error: "Record not found" });
    
    if (categoryData.type === 'department'){
        try {
            const category = await Category.findOne({
                where: { id: id },
                include: [{
                    model: Career,
                    as: 'careers' 
                }]
            });
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: "Error fetching department" });
        }
    } else {
        try {
            const category = await Category.findOne({
                where: { id: id },
                include: [{
                    model: Blog,
                    as: 'blogs' 
                }]
            });
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: "Error fetching category" });
        }
    }

  } catch (error) {
    res.status(500).json({ error: "Error fetching category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const type = req.query.type;
    const updateData= req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    let updatedData ;
        updatedData = await category.update(updateData, {where: {type:type}});
        res.json(category);

  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const type = req.query.type;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Record not found" });
    if (type === 'category'){
        await category.destroy({where: {type: type}});
        res.json({ message: "Category deleted successfully" });
    } else {
        await category.destroy({where: {type: type}});
        res.json({ message: "Department deleted successfully" });
    }

  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
};

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
