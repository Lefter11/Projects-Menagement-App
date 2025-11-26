const express = require('express');
const router = express.Router();
const {
  addMember,
  listMembers,
  removeMember
} = require("../controllers/projectMembers.controller");
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


router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject); 
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get("/:id/members", listMembers);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
module.exports = router;
