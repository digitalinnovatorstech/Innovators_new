const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Settings = sequelize.define("Settings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dashboardLogo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  favicon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  socialMedia: {
    type: DataTypes.JSON, // Stores multiple links as an array of objects
    allowNull: true,
    defaultValue: [],
  },
});

module.exports = Settings;
