const express = require('express');
const { db } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All paper routes require authentication
router.use(authMiddleware);

// GET /api/papers/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const totalRow = await db.getAsync(
      'SELECT COUNT(*) as count FROM papers WHERE user_id = ?',
      [userId]
    );

    const readingRow = await db.getAsync(
      'SELECT COUNT(*) as count FROM papers WHERE user_id = ? AND status = "Reading"',
      [userId]
    );

    const completedRow = await db.getAsync(
      'SELECT COUNT(*) as count FROM papers WHERE user_id = ? AND status = "Completed"',
      [userId]
    );

    const importantRow = await db.getAsync(
      'SELECT COUNT(*) as count FROM papers WHERE user_id = ? AND priority = "High"',
      [userId]
    );

    const recentPapers = await db.allAsync(
      'SELECT * FROM papers WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    return res.json({
      total: totalRow.count,
      reading: readingRow.count,
      completed: completedRow.count,
      important: importantRow.count,
      recent: recentPapers
    });
  } catch (error) {
    console.error('Error fetching paper stats:', error);
    return res.status(500).json({ error: 'Failed to fetch paper statistics' });
  }
});

// GET /api/papers - Get all papers for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const papers = await db.allAsync(
      'SELECT * FROM papers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.json(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    return res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// GET /api/papers/:id - Get single paper detail
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const paperId = req.params.id;

    const paper = await db.getAsync(
      'SELECT * FROM papers WHERE id = ? AND user_id = ?',
      [paperId, userId]
    );

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    return res.json(paper);
  } catch (error) {
    console.error('Error fetching paper detail:', error);
    return res.status(500).json({ error: 'Failed to fetch paper detail' });
  }
});

// POST /api/papers - Create new paper
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      authors = '',
      year = null,
      category = 'Other',
      status = 'To Read',
      priority = 'Medium',
      notes = ''
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const parsedYear = year ? parseInt(year, 10) : null;

    const result = await db.runAsync(
      `INSERT INTO papers (user_id, title, authors, year, category, status, priority, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        authors.trim(),
        parsedYear,
        category.trim(),
        status.trim(),
        priority.trim(),
        notes.trim()
      ]
    );

    const createdPaper = await db.getAsync(
      'SELECT * FROM papers WHERE id = ?',
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Paper created successfully',
      paper: createdPaper
    });
  } catch (error) {
    console.error('Error creating paper:', error);
    return res.status(500).json({ error: 'Failed to create paper' });
  }
});

// PUT /api/papers/:id - Update existing paper
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const paperId = req.params.id;

    // Check if paper exists and belongs to user
    const existing = await db.getAsync(
      'SELECT * FROM papers WHERE id = ? AND user_id = ?',
      [paperId, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const {
      title,
      authors = '',
      year = null,
      category = 'Other',
      status = 'To Read',
      priority = 'Medium',
      notes = ''
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const parsedYear = year ? parseInt(year, 10) : null;

    await db.runAsync(
      `UPDATE papers
       SET title = ?, authors = ?, year = ?, category = ?, status = ?, priority = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        authors.trim(),
        parsedYear,
        category.trim(),
        status.trim(),
        priority.trim(),
        notes.trim(),
        paperId,
        userId
      ]
    );

    const updatedPaper = await db.getAsync(
      'SELECT * FROM papers WHERE id = ?',
      [paperId]
    );

    return res.json({
      message: 'Paper updated successfully',
      paper: updatedPaper
    });
  } catch (error) {
    console.error('Error updating paper:', error);
    return res.status(500).json({ error: 'Failed to update paper' });
  }
});

// DELETE /api/papers/:id - Delete paper
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const paperId = req.params.id;

    const existing = await db.getAsync(
      'SELECT * FROM papers WHERE id = ? AND user_id = ?',
      [paperId, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    await db.runAsync('DELETE FROM papers WHERE id = ? AND user_id = ?', [paperId, userId]);

    return res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    return res.status(500).json({ error: 'Failed to delete paper' });
  }
});

module.exports = router;
