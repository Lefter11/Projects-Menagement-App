const db = require("../db");


exports.addMember = async (req, res) => {
  try {
    const ownerId = req.user.sub;
    const { id: projectId } = req.params;
    const { email, role = "member" } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    //kontrollon owner i projektit
    const proj = await db.query(
      "SELECT * FROM projects WHERE id = $1 AND owner_id = $2",
      [projectId, ownerId]
    );

    if (!proj.rows.length)
      return res.status(403).json({ message: "Not allowed" });

    // gjen userin 
    const userRes = await db.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );
    const user = userRes.rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    // shton tek memberi
    const result = await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id)
       DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [projectId, user.id, role]
    );

    res.json({ user, role: result.rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.listMembers = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    // aksesin
    const access = await db.query(
      `SELECT p.id
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [id, userId]
    );
    if (!access.rows.length)
      return res.status(403).json({ message: "Not allowed" });

    // owneri
    const owner = await db.query(
      `SELECT u.id, u.name, u.email, 'owner' AS role
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    
    const members = await db.query(
      `SELECT u.id, u.name, u.email, pm.role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );

    res.json({
      owner: owner.rows[0],
      members: members.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.removeMember = async (req, res) => {
  try {
    const ownerId = req.user.sub;
    const { id: projectId, userId } = req.params;

  
    const proj = await db.query(
      "SELECT * FROM projects WHERE id = $1 AND owner_id = $2",
      [projectId, ownerId]
    );

    if (!proj.rows.length)
      return res.status(403).json({ message: "Not allowed" });

    const result = await db.query(
      "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id",
      [projectId, userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "User not in project" });

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
