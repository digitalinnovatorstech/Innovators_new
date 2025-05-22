const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./categories");

const Career = sequelize.define("Career", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references:{
        model: Category,
        key: 'id'
    }
  },
  roleDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  experience: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  jobType: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  locations: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  content: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("draft", "published"),
    defaultValue: "draft",
  },
}, {
  tableName: "careers",
  timestamps: true,
});

module.exports = Career;
