const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GitProgress = sequelize.define('GitProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  completed_lessons: {
    type: DataTypes.TEXT, // Stored as JSON stringified array of lesson IDs
    defaultValue: '[]'
  },
  completed_challenges: {
    type: DataTypes.TEXT, // Stored as JSON stringified array of challenge IDs
    defaultValue: '[]'
  },
  quiz_scores: {
    type: DataTypes.TEXT, // Stored as JSON stringified object { [quizId]: { score, total, percentage, passed } }
    defaultValue: '{}'
  },
  skill_level: {
    type: DataTypes.STRING,
    defaultValue: 'Beginner'
  },
  last_active_lesson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  achievements: {
    type: DataTypes.TEXT, // Stored as JSON stringified array of unlocked badges
    defaultValue: '[]'
  }
}, {
  tableName: 'GitProgress',
  timestamps: true
});

module.exports = GitProgress;
