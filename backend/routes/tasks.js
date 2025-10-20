const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const { category, status, date, search } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(due_date) = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取指定日期范围的任务
router.get('/range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const query = `
      SELECT * FROM tasks
      WHERE due_date BETWEEN ? AND ?
      ORDER BY due_date ASC, priority DESC
    `;

    const [rows] = await db.query(query, [start_date, end_date]);
    res.json(rows);
  } catch (error) {
    console.error('获取任务范围失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个任务
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建任务
router.post('/', async (req, res) => {
  try {
    const { title, description, category, status, priority, due_date } = req.body;

    const query = `
      INSERT INTO tasks (title, description, category, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      description || null,
      category || 'research',
      status || 'pending',
      priority || 'medium',
      due_date || null
    ]);

    res.status(201).json({ id: result.insertId, message: 'Task created successfully' });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新任务
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, status, priority, due_date } = req.body;

    let query = 'UPDATE tasks SET ';
    const params = [];
    const updates = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);

      // 如果状态变为完成，设置完成时间
      if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批量更新任务状态
router.patch('/batch/status', async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid task IDs' });
    }

    const placeholders = ids.map(() => '?').join(',');
    let query = `UPDATE tasks SET status = ?`;
    const params = [status];

    if (status === 'completed') {
      query += ', completed_at = NOW()';
    }

    query += ` WHERE id IN (${placeholders})`;
    params.push(...ids);

    const [result] = await db.query(query, params);

    res.json({
      message: 'Tasks updated successfully',
      updated: result.affectedRows
    });
  } catch (error) {
    console.error('批量更新任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
