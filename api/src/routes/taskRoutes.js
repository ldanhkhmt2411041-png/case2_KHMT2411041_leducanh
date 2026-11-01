const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require('../controllers/taskController');
const {
  getAssignees,
  addAssignees,
  updatePrimaryAssignee,
  removeAssignee
} = require('../controllers/assignmentController');
const {
  getShares,
  addShare,
  updateSharePermission,
  removeShare
} = require('../controllers/taskShareController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

router.route('/:id/assignees')
  .get(getAssignees)
  .post(addAssignees);

router.route('/:id/assignees/:userId')
  .patch(updatePrimaryAssignee)
  .delete(removeAssignee);

router.route('/:id/shares')
  .get(getShares)
  .post(addShare);

router.route('/:id/shares/:shareId')
  .patch(updateSharePermission)
  .delete(removeShare);

module.exports = router;
