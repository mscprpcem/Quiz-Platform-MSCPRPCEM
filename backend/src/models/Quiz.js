const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  event_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  join_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'waiting_lobby', 'in_progress', 'completed'),
    defaultValue: 'draft'
  },
  mode: {
    type: DataTypes.ENUM('LIVE', 'SCHEDULED'),
    defaultValue: 'LIVE'
  },
  schedule_type: {
    type: DataTypes.ENUM('ONE_TIME', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Kolkata'
  },
  time_limit: {
    type: DataTypes.INTEGER, // in minutes, 0 means no limit
    defaultValue: 30
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  score_policy: {
    type: DataTypes.ENUM('BEST', 'LATEST', 'FIRST'),
    defaultValue: 'BEST'
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shuffle_answers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  require_fullscreen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  anti_cheat_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  max_violations: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  positive_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  negative_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  show_leaderboard: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  schedule_config: {
    type: DataTypes.TEXT, // JSON stringified configuration for custom recurrence rules
    allowNull: true
  },
  current_question_index: {
    type: DataTypes.INTEGER,
    defaultValue: -1 // -1 means lobby. 0 means question 1.
  },
  current_question_status: {
    type: DataTypes.ENUM('closed', 'released', 'timer_ended'),
    defaultValue: 'closed'
  },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'DBMS'
  },
  scheduled_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduled_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verification_synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verification_event_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verification_error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  svg_template: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  custom_slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  badge_title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  badge_sys_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  badge_issued_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: 'Intermediate',
    allowNull: true
  }
});

module.exports = Quiz;
