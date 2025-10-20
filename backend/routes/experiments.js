const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取实验计划列表
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM experiment_plans WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_date DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取实验计划失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个实验计划
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM experiment_plans WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('获取实验详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建实验计划
router.post('/', async (req, res) => {
  try {
    const { title, objective, methodology, expected_results, status, start_date, end_date } = req.body;

    const query = `
      INSERT INTO experiment_plans (title, objective, methodology, expected_results, status, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      objective || null,
      methodology || null,
      expected_results || null,
      status || 'planned',
      start_date || null,
      end_date || null
    ]);

    res.status(201).json({ id: result.insertId, message: 'Experiment created successfully' });
  } catch (error) {
    console.error('创建实验计划失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新实验计划
router.put('/:id', async (req, res) => {
  try {
    const { title, objective, methodology, expected_results, actual_results, status, start_date, end_date } = req.body;

    let query = 'UPDATE experiment_plans SET ';
    const params = [];
    const updates = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (objective !== undefined) { updates.push('objective = ?'); params.push(objective); }
    if (methodology !== undefined) { updates.push('methodology = ?'); params.push(methodology); }
    if (expected_results !== undefined) { updates.push('expected_results = ?'); params.push(expected_results); }
    if (actual_results !== undefined) { updates.push('actual_results = ?'); params.push(actual_results); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (start_date !== undefined) { updates.push('start_date = ?'); params.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); params.push(end_date); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ message: 'Experiment updated successfully' });
  } catch (error) {
    console.error('更新实验计划失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除实验计划
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM experiment_plans WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error('删除实验计划失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
