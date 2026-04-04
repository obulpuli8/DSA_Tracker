const Problem = require('../models/Problem');
const { validationResult } = require('express-validator');

// @desc    Get all problems for user
// @route   GET /api/problems
// @access  Private
const getProblems = async (req, res) => {
  try {
    const { status, difficulty, topic, platform, search, sort = '-solvedAt', page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;
    if (topic) filter.topics = { $in: [topic] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      count: problems.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      problems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, user: req.user._id });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add problem
// @route   POST /api/problems
// @access  Private
const addProblem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const problem = await Problem.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete problems
// @route   DELETE /api/problems/bulk
// @access  Private
const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await Problem.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ success: true, message: `${ids.length} problems deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProblems, getProblem, addProblem, updateProblem, deleteProblem, bulkDelete };
