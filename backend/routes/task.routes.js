const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

router.use(authenticate);

router.get('/', getTasks);      // /tasks dhe /tasks?project_id=...
router.get('/:id', getTask);    // /tasks/1
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
