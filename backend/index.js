const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  const result = await pool.query(
    'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
    [title, description]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log('Server running on port 3000'));
console.log("Database URL:", process.env.DATABASE_URL);