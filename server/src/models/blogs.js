const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./categories");

const Blog = sequelize.define("Blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permalink: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  content_structure: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  comments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), // storing tag ids
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING, // banner image url
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("draft", "published"),
    defaultValue: "draft",
  },
}, {
  tableName: "blogs",
  timestamps: true,
});

module.exports = Blog;







// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const Category = require("./categories");

// const Blog = sequelize.define("Blog", {
//   blogID: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   image: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },     
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   categories: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references:{
//         model: Category,
//         key: "id"
//     }
//   },
//   author: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   content:{
//     type: DataTypes.JSONB,
//     allowNull: true
//   },
//   status: {
//     type: DataTypes.ENUM("draft", "published"),
//     allowNull: false,
//     defaultValue: "draft",
//   },
// }, {
//   tableName: "blogs",
//   timestamps: true,
// });

// module.exports = Blog;