const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['LeetCode', 'Codeforces', 'GeeksForGeeks', 'HackerRank', 'AtCoder', 'CodeChef', 'Other'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
      index: true,
    },
    topics: {
      type: [String],
      required: [true, 'At least one topic is required'],
      validate: [(arr) => arr.length > 0, 'At least one topic required'],
    },
    status: {
      type: String,
      enum: ['Solved', 'Attempted', 'Revisit'],
      default: 'Solved',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    timeTaken: {
      type: Number, // in minutes
      default: 0,
      min: 0,
    },
    problemUrl: {
      type: String,
      default: '',
    },
    solvedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    revisitCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    approach: {
      type: String,
      enum: ['Brute Force', 'Optimal', 'Space Optimized', 'Not Set'],
      default: 'Not Set',
    },
    complexity: {
      time: { type: String, default: '' },
      space: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Compound index for user + date queries
ProblemSchema.index({ user: 1, solvedAt: -1 });
ProblemSchema.index({ user: 1, topics: 1 });

module.exports = mongoose.model('Problem', ProblemSchema);
