const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "comments",
  timestamps: true,
});

module.exports = Comment;
