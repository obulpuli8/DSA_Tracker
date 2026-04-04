const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProblems, getProblem, addProblem, updateProblem, deleteProblem, bulkDelete
} = require('../controllers/problemController');
const { protect } = require('../middleware/auth');

const problemValidation = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('platform').isIn(['LeetCode','Codeforces','GeeksForGeeks','HackerRank','AtCoder','CodeChef','Other']).withMessage('Invalid platform'),
  body('difficulty').isIn(['Easy','Medium','Hard']).withMessage('Invalid difficulty'),
  body('topics').isArray({ min: 1 }).withMessage('At least one topic required'),
];

router.use(protect);

router.route('/')
  .get(getProblems)
  .post(problemValidation, addProblem);

router.delete('/bulk', bulkDelete);

router.route('/:id')
  .get(getProblem)
  .put(updateProblem)
  .delete(deleteProblem);

module.exports = router;
