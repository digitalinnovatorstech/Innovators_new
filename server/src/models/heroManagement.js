const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HeroManagement = sequelize.define("HeroManagement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("publish", "draft"),
    allowNull: false,
    defaultValue: "draft",
  },
}, {
  tableName: "heroManagements",
  timestamps: true,
});

module.exports = HeroManagement;