const db = require("../db");

// GET /projects
const getProjects = async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await db.query(
      `SELECT DISTINCT p.*
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.owner_id = $1 OR pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getProjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /projects
const createProject = async (req, res) => {
  try {
    console.log("👉 createProject body:", req.body, "TYPE:", typeof req.body);

    // Sigurohemi që body është objekt
    const body = req.body && typeof req.body === "object" ? req.body : {};

    const { name, description } = body;

    // Nëse name mungon, kthe 400, mos plaso
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return res.status(400).json({ message: 'Field "name" is required' });
    }

    const userId = req.user.sub;

    const result = await db.query(
      "INSERT INTO projects (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *",
      [name, description || null, userId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error("❌ Error në createProject:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /projects/:id
const getProject = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1
         AND (p.owner_id = $2 OR pm.user_id = $2)
       LIMIT 1`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Project not found or no access" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /projects/:id
const updateProject = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { name, description } = body;

    const result = await db.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id=$3 AND owner_id=$4
       RETURNING *`,
      [name || null, description || null, id, userId]
    );

    const project = result.rows[0];
    if (!project) return res.status(404).json({ message: "Not found" });

    res.json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /projects/:id
const deleteProject = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM projects WHERE id=$1 AND owner_id=$2 RETURNING id",
      [id, userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
