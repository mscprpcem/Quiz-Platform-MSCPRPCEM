const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  poster_url: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://mscprpcem.blob.core.windows.net/events/clean_529287766.png'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Technical Workshop'
  },
  mode: {
    type: DataTypes.STRING,
    defaultValue: 'Offline' // 'Offline' | 'Online' | 'Hybrid'
  },
  venue: {
    type: DataTypes.STRING,
    defaultValue: 'PRPCEM Amravati'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  max_registrations: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null // null indicates unlimited capacity
  },
  initial_registration_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fee: {
    type: DataTypes.STRING,
    defaultValue: 'Free'
  },
  is_registration_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rewards: {
    type: DataTypes.STRING,
    defaultValue: 'Certificates & Swags'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'upcoming'
  },
  registration_type: {
    type: DataTypes.STRING,
    defaultValue: 'internal' // 'internal' | 'external'
  },
  external_registration_url: {
    type: DataTypes.STRING(1024),
    allowNull: true
  },
  auto_redirect_external: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Event;
