const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取学习记录
router.get('/', async (req, res) => {
  try {
    const { subject, date, start_date, end_date } = req.query;
    let query = 'SELECT * FROM learning_progress WHERE 1=1';
    const params = [];

    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取学习记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建学习记录
router.post('/', async (req, res) => {
  try {
    const { subject, content, hours, notes, date } = req.body;

    const query = `
      INSERT INTO learning_progress (subject, content, hours, notes, date)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      subject,
      content || null,
      hours || 0,
      notes || null,
      date || new Date().toISOString().split('T')[0]
    ]);

    res.status(201).json({ id: result.insertId, message: 'Learning record created' });
  } catch (error) {
    console.error('创建学习记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新学习记录
router.put('/:id', async (req, res) => {
  try {
    const { subject, content, hours, notes, date } = req.body;

    const query = `
      UPDATE learning_progress
      SET subject = ?, content = ?, hours = ?, notes = ?, date = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [subject, content, hours, notes, date, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Learning record not found' });
    }

    res.json({ message: 'Learning record updated' });
  } catch (error) {
    console.error('更新学习记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除学习记录
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM learning_progress WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Learning record not found' });
    }

    res.json({ message: 'Learning record deleted' });
  } catch (error) {
    console.error('删除学习记录失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
