const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const JobApplication = sequelize.define('JobApplication', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resume: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  work: {
    type: DataTypes.STRING,
    allowNull: true 
  }
}, {
  tableName: 'job_applications',
  timestamps: true,
});

module.exports = JobApplication;
