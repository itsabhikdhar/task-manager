const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description = '' } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), description.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const taskId = Number(req.params.id);
  const { title, description, completed } = req.body;

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be true or false' });
  }

  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
      [title.trim(), (description || '').trim(), completed, taskId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
console.log("Database URL:", process.env.DATABASE_URL);
