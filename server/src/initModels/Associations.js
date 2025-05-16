const career = require('../models/careers');
const categories = require ('../models/categories');
const blogs = require('../models/blogs');
const tags = require('../models/tags')


const defineAssociations = () =>{
    categories.hasMany(career,{
        foreignKey: 'department',
        as:'careers'
    });
    career.belongsTo(categories,{
        foreignKey: 'department',
        as:'departmentInfo'
    });

    categories.hasMany(blogs,{
        foreignKey: 'category',
        as: 'blogs'
    });

    blogs.belongsTo(categories,{
        foreignKey: 'category',
        as: 'categories'
    });

    
}

module.exports = {defineAssociations}