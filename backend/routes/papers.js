const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取论文列表
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM paper_reading WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (title LIKE ? OR authors LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('获取论文列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单篇论文
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM paper_reading WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('获取论文详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加论文
router.post('/', async (req, res) => {
  try {
    const { title, authors, publication, year, status, notes, key_points, rating, pdf_link } = req.body;

    const query = `
      INSERT INTO paper_reading (title, authors, publication, year, status, notes, key_points, rating, pdf_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      title,
      authors || null,
      publication || null,
      year || null,
      status || 'to_read',
      notes || null,
      key_points || null,
      rating || null,
      pdf_link || null
    ]);

    res.status(201).json({ id: result.insertId, message: 'Paper added successfully' });
  } catch (error) {
    console.error('添加论文失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新论文
router.put('/:id', async (req, res) => {
  try {
    const { title, authors, publication, year, status, notes, key_points, rating, pdf_link } = req.body;

    let query = 'UPDATE paper_reading SET ';
    const params = [];
    const updates = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (authors !== undefined) { updates.push('authors = ?'); params.push(authors); }
    if (publication !== undefined) { updates.push('publication = ?'); params.push(publication); }
    if (year !== undefined) { updates.push('year = ?'); params.push(year); }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'completed') {
        updates.push('read_at = NOW()');
      }
    }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (key_points !== undefined) { updates.push('key_points = ?'); params.push(key_points); }
    if (rating !== undefined) { updates.push('rating = ?'); params.push(rating); }
    if (pdf_link !== undefined) { updates.push('pdf_link = ?'); params.push(pdf_link); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.json({ message: 'Paper updated successfully' });
  } catch (error) {
    console.error('更新论文失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除论文
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM paper_reading WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('删除论文失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
