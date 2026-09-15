const express = require('express');
const router = express.Router();
const { sequelize, User, Admin, QuizAttempt, EventRegistration, Participant, Subscriber } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

// ==========================================
// GET /api/admin/users — Paginated User Directory
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = (req.query.search || '').trim();
    const roleFilter = (req.query.role || 'all').trim();
    const statusFilter = (req.query.status || 'all').trim();
    const sortBy = ['name', 'email', 'createdAt', 'is_verified', 'role'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'createdAt';
    const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereConditions = [];
    const isPostgres = sequelize.getDialect() === 'postgres';
    const likeOp = isPostgres ? Op.iLike : Op.like;

    // Search condition across Name, Email, Username, College
    if (search) {
      whereConditions.push({
        [Op.or]: [
          { name: { [likeOp]: `%${search}%` } },
          { email: { [likeOp]: `%${search}%` } },
          { username: { [likeOp]: `%${search}%` } },
          { college: { [likeOp]: `%${search}%` } }
        ]
      });
    }

    // Role filter
    if (roleFilter && roleFilter !== 'all') {
      whereConditions.push({ role: roleFilter });
    }

    // Verification status filter
    if (statusFilter === 'verified') {
      whereConditions.push({ is_verified: true });
    } else if (statusFilter === 'pending' || statusFilter === 'unverified') {
      whereConditions.push({ is_verified: false });
    }

    const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    // Execute paginated query
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'subject_id', 'name', 'email', 'username', 'college', 'role', 'is_verified', 'createdAt', 'updatedAt'],
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    // Calculate aggregate statistics
    const [totalUsers, totalVerified, totalStudents] = await Promise.all([
      User.count(),
      User.count({ where: { is_verified: true } }),
      User.count({ where: { role: 'student' } })
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return res.json({
      success: true,
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      },
      stats: {
        totalUsers,
        totalVerified,
        totalStudents,
        totalPending: totalUsers - totalVerified
      }
    });
  } catch (err) {
    console.error('Error fetching user directory:', err);
    return res.status(500).json({ error: 'Failed to fetch user directory: ' + err.message });
  }
});

// ==========================================
// PATCH /api/admin/users/:id/verify — Toggle or Set Verification
// ==========================================
router.patch('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Toggle if boolean not provided explicitly
    const nextStatus = typeof is_verified === 'boolean' ? is_verified : !user.is_verified;
    user.is_verified = nextStatus;
    if (nextStatus) {
      user.otp = null;
      user.otp_expiry = null;
    }
    await user.save();

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: user.is_verified
      },
      message: `User ${user.name} is now ${user.is_verified ? 'verified' : 'unverified'}.`
    });
  } catch (err) {
    console.error('Error updating user verification:', err);
    return res.status(500).json({ error: 'Failed to update verification status: ' + err.message });
  }
});

// ==========================================
// POST /api/admin/users/bulk-verify — Bulk Verify or Unverify Users
// ==========================================
router.post('/bulk-verify', authMiddleware, async (req, res) => {
  try {
    const { userIds, verify = true } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of user IDs.' });
    }

    const [updatedCount] = await User.update(
      { is_verified: Boolean(verify) },
      { where: { id: { [Op.in]: userIds } } }
    );

    return res.json({
      success: true,
      updatedCount,
      message: `Successfully ${verify ? 'verified' : 'unverified'} ${updatedCount} user(s).`
    });
  } catch (err) {
    console.error('Error bulk updating verification:', err);
    return res.status(500).json({ error: 'Failed to update users: ' + err.message });
  }
});

// ==========================================
// PATCH /api/admin/users/:id/role — Update User Role
// ==========================================
router.patch('/:id/role', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['student', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be "student" or "admin".' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.role = role.toLowerCase();
    await user.save();

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      message: `Role for ${user.name} updated to ${user.role.toUpperCase()}.`
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    return res.status(500).json({ error: 'Failed to update user role: ' + err.message });
  }
});

// ==========================================
// DELETE /api/admin/users/:id — Delete Single User
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userEmail = user.email ? user.email.toLowerCase().trim() : null;
    const userName = user.name;

    // Cascade cleanup across all tables so user's email does not linger in mail sending or registrations
    try {
      if (userEmail) {
        if (EventRegistration) {
          await EventRegistration.destroy({
            where: {
              [Op.or]: [
                { email: userEmail },
                { user_id: user.id }
              ]
            }
          }).catch(() => {});
        }
        if (QuizAttempt) {
          await QuizAttempt.destroy({
            where: {
              [Op.or]: [
                { email: userEmail },
                { participant_email: userEmail }
              ]
            }
          }).catch(() => {});
        }
        if (Participant) {
          await Participant.destroy({ where: { email: userEmail } }).catch(() => {});
        }
        if (Subscriber) {
          await Subscriber.destroy({ where: { email: userEmail } }).catch(() => {});
        }
      }
    } catch (cleanupErr) {
      console.warn('Notice: associated records cleanup warning on user delete:', cleanupErr.message);
    }

    // Delete the user record
    await user.destroy();

    return res.json({
      success: true,
      message: `User ${userName} (${userEmail}) and all associated records have been deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
});

// ==========================================
// POST /api/admin/users/bulk-delete — Bulk Delete Users
// ==========================================
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of user IDs to delete.' });
    }

    // Find users to clean up all related records
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'email']
    });

    const emails = users.map(u => u.email ? u.email.toLowerCase().trim() : null).filter(Boolean);

    if (emails.length > 0) {
      try {
        if (EventRegistration) {
          await EventRegistration.destroy({
            where: {
              [Op.or]: [
                { email: { [Op.in]: emails } },
                { user_id: { [Op.in]: userIds } }
              ]
            }
          }).catch(() => {});
        }
        if (QuizAttempt) {
          await QuizAttempt.destroy({
            where: {
              [Op.or]: [
                { email: { [Op.in]: emails } },
                { participant_email: { [Op.in]: emails } }
              ]
            }
          }).catch(() => {});
        }
        if (Participant) {
          await Participant.destroy({ where: { email: { [Op.in]: emails } } }).catch(() => {});
        }
        if (Subscriber) {
          await Subscriber.destroy({ where: { email: { [Op.in]: emails } } }).catch(() => {});
        }
      } catch (cleanupErr) {
        console.warn('Notice: bulk cleanup warning:', cleanupErr.message);
      }
    }

    const deletedCount = await User.destroy({
      where: { id: { [Op.in]: userIds } }
    });

    return res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} user(s) and cleared associated records.`,
      deletedCount
    });
  } catch (err) {
    console.error('Error bulk deleting users:', err);
    return res.status(500).json({ error: 'Failed to bulk delete users: ' + err.message });
  }
});

// ==========================================
// POST /api/admin/users/seed-samples — Quick seed for demo/testing
// ==========================================
router.post('/seed-samples', authMiddleware, async (req, res) => {
  try {
    const samples = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@prpcem.ac.in',
        username: 'aarav_sharma',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: true,
        subject_id: 'PRP-2026-CSE-001'
      },
      {
        name: 'Priya Deshmukh',
        email: 'priya.deshmukh@prpcem.ac.in',
        username: 'priya_d',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: true,
        subject_id: 'PRP-2026-CSE-014'
      },
      {
        name: 'Rohan Patil',
        email: 'rohan.patil@prpcem.ac.in',
        username: 'rohan_patil',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: false,
        subject_id: 'PRP-2026-IT-008'
      },
      {
        name: 'Ananya Verma',
        email: 'ananya.verma@prpcem.ac.in',
        username: 'ananya_v',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: true,
        subject_id: 'PRP-2026-AI-023'
      },
      {
        name: 'Siddharth Kulkarni',
        email: 'siddharth.k@prpcem.ac.in',
        username: 'sid_kulkarni',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: false,
        subject_id: 'PRP-2026-EXTC-005'
      },
      {
        name: 'Snehal Wankhede',
        email: 'snehal.w@prpcem.ac.in',
        username: 'snehal_w',
        college: 'PRPCEM Amravati',
        role: 'student',
        is_verified: true,
        subject_id: 'PRP-2026-CSE-042'
      }
    ];

    let createdCount = 0;
    for (const sample of samples) {
      const exists = await User.findOne({ where: { email: sample.email } });
      if (!exists) {
        await User.create(sample);
        createdCount++;
      }
    }

    return res.json({
      success: true,
      createdCount,
      message: createdCount > 0
        ? `Successfully generated ${createdCount} demo student accounts.`
        : 'Demo student accounts already exist.'
    });
  } catch (err) {
    console.error('Error seeding demo students:', err);
    return res.status(500).json({ error: 'Failed to seed sample students: ' + err.message });
  }
});

module.exports = router;
