const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Generaltalk = sequelize.define('Generaltalk', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  connectingFrom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reachMeAt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  workAt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  services: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'generalTalks',
  timestamps: true,
});

module.exports = Generaltalk;
