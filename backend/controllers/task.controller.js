const db = require('../db');

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { project_id } = req.query;

    let result;

    if (project_id) {
      result = await db.query(
        `SELECT t.*
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         LEFT JOIN project_members pm ON pm.project_id = p.id
         WHERE t.project_id = $1
           AND (p.owner_id = $2 OR pm.user_id = $2)
         ORDER BY t.created_at DESC`,
        [project_id, userId]
      );
    } else {
      result = await db.query(
        `SELECT t.*
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         LEFT JOIN project_members pm ON pm.project_id = p.id
         WHERE (p.owner_id = $1 OR pm.user_id = $1)
         ORDER BY t.created_at DESC`,
        [userId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTask = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await db.query(
      `SELECT t.*
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND p.owner_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { title, description, project_id, status } = req.body;

    if (!title || !project_id) {
      return res
        .status(400)
        .json({ message: 'title and project_id required' });
    }

    const proj = await db.query(
      'SELECT id FROM projects WHERE id=$1 AND owner_id=$2',
      [project_id, userId]
    );

    if (proj.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await db.query(
      `INSERT INTO tasks (title, description, status, project_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [title, description || null, status || 'todo', project_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const result = await db.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [title, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM tasks WHERE id=$1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
