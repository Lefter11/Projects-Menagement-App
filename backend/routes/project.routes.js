// backend/routes/project.routes.js
const express = require('express');
const router = express.Router();
const {
  addMember,
  listMembers,
  removeMember
} = require("../controllers/projectMembers.controller");
// Body parser – vendoset këtu te router (jo te server.js)
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const { authenticate } = require('../middleware/auth');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');

// Middlewares
router.use(authenticate);

// Routes
router.get('/', getProjects);
router.post('/', createProject); // pa AJV
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get("/:id/members", listMembers);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
module.exports = router;
