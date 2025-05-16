const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // adjust path as needed

const Contact = sequelize.define('Contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  connectingfrom: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reachmeat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  callme: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  workat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  services: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectbudget: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  document: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'contactUs',
});

module.exports = Contact;
