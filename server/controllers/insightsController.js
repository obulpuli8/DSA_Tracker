const Problem = require('../models/Problem');
const { subDays, startOfDay, format, getISOWeek, getYear, parseISO, differenceInCalendarDays } = require('date-fns');

/**
 * Generate all smart insights for the authenticated user
 */
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const problems = await Problem.find({ user: userId }).sort({ solvedAt: -1 });

    if (problems.length === 0) {
      return res.json({ success: true, data: emptyInsights() });
    }

    const [
      overview,
      streak,
      heatmap,
      topicStats,
      difficultyDist,
      velocityData,
      platformDist,
      timeProductivity,
      weaknesses,
      recommendations,
      recentActivity,
    ] = await Promise.all([
      computeOverview(problems, req.user),
      computeStreak(problems),
      computeHeatmap(problems),
      computeTopicStats(problems),
      computeDifficultyDistribution(problems),
      computeVelocity(problems),
      computePlatformDistribution(problems),
      computeTimeProductivity(problems),
      computeWeaknesses(problems),
      computeRecommendations(problems, req.user),
      computeRecentActivity(problems),
    ]);

    res.json({
      success: true,
      data: {
        overview,
        streak,
        heatmap,
        topicStats,
        difficultyDist,
        velocityData,
        platformDist,
        timeProductivity,
        weaknesses,
        recommendations,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Overview Stats ───────────────────────────────────────────────────────────
const computeOverview = (problems, user) => {
  const solved = problems.filter((p) => p.status === 'Solved').length;
  const revisit = problems.filter((p) => p.status === 'Revisit').length;
  const attempted = problems.filter((p) => p.status === 'Attempted').length;
  const totalTime = problems.reduce((acc, p) => acc + (p.timeTaken || 0), 0);
  const avgTime = problems.length ? Math.round(totalTime / problems.length) : 0;

  const today = startOfDay(new Date());
  const todayCount = problems.filter(
    (p) => startOfDay(new Date(p.solvedAt)).getTime() === today.getTime()
  ).length;

  const last7Days = problems.filter(
    (p) => new Date(p.solvedAt) >= subDays(new Date(), 7)
  ).length;

  return {
    total: problems.length,
    solved,
    revisit,
    attempted,
    avgTime,
    totalTime,
    todayCount,
    last7Days,
    solveRate: problems.length ? Math.round((solved / problems.length) * 100) : 0,
    targetProgress: user.targetProblems ? Math.round((solved / user.targetProblems) * 100) : 0,
    targetProblems: user.targetProblems || 100,
    dailyGoal: user.dailyGoal || 3,
    dailyGoalProgress: Math.min(100, Math.round((todayCount / (user.dailyGoal || 3)) * 100)),
  };
};

// ─── Streak ───────────────────────────────────────────────────────────────────
const computeStreak = (problems) => {
  const uniqueDates = [
    ...new Set(problems.map((p) => format(new Date(p.solvedAt), 'yyyy-MM-dd'))),
  ].sort((a, b) => b.localeCompare(a)); // newest first

  if (uniqueDates.length === 0) return { current: 0, longest: 0, lastSolvedDate: null };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if streak is active (solved today or yesterday)
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = differenceInCalendarDays(
        parseISO(uniqueDates[i - 1]),
        parseISO(uniqueDates[i])
      );
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Compute longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = differenceInCalendarDays(parseISO(uniqueDates[i - 1]), parseISO(uniqueDates[i]));
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak, lastSolvedDate: uniqueDates[0] };
};

// ─── Heatmap (last 365 days) ──────────────────────────────────────────────────
const computeHeatmap = (problems) => {
  const countByDate = {};
  problems.forEach((p) => {
    const date = format(new Date(p.solvedAt), 'yyyy-MM-dd');
    countByDate[date] = (countByDate[date] || 0) + 1;
  });

  return Object.entries(countByDate).map(([date, count]) => ({ date, count }));
};

// ─── Topic Stats ──────────────────────────────────────────────────────────────
const computeTopicStats = (problems) => {
  const topicMap = {};
  problems.forEach((p) => {
    p.topics.forEach((topic) => {
      if (!topicMap[topic]) topicMap[topic] = { topic, total: 0, solved: 0, revisit: 0, avgTime: 0, times: [] };
      topicMap[topic].total++;
      if (p.status === 'Solved') topicMap[topic].solved++;
      if (p.status === 'Revisit') topicMap[topic].revisit++;
      if (p.timeTaken) topicMap[topic].times.push(p.timeTaken);
    });
  });

  return Object.values(topicMap)
    .map((t) => ({
      ...t,
      avgTime: t.times.length ? Math.round(t.times.reduce((a, b) => a + b, 0) / t.times.length) : 0,
      solveRate: t.total ? Math.round((t.solved / t.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

// ─── Difficulty Distribution ──────────────────────────────────────────────────
const computeDifficultyDistribution = (problems) => {
  const dist = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach((p) => { dist[p.difficulty]++; });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
};

// ─── Velocity (last 12 weeks) ─────────────────────────────────────────────────
const computeVelocity = (problems) => {
  const weekMap = {};
  problems.forEach((p) => {
    const d = new Date(p.solvedAt);
    const key = `${getYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`;
    weekMap[key] = (weekMap[key] || 0) + 1;
  });

  // Generate last 12 weeks
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const d = subDays(new Date(), i * 7);
    const key = `${getYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`;
    weeks.push({ week: key.split('-W')[1], count: weekMap[key] || 0 });
  }
  return weeks;
};

// ─── Platform Distribution ────────────────────────────────────────────────────
const computePlatformDistribution = (problems) => {
  const platMap = {};
  problems.forEach((p) => { platMap[p.platform] = (platMap[p.platform] || 0) + 1; });
  return Object.entries(platMap).map(([name, value]) => ({ name, value }));
};

// ─── Time of Day Productivity ─────────────────────────────────────────────────
const computeTimeProductivity = (problems) => {
  const hours = Array(24).fill(0);
  problems.forEach((p) => {
    const h = new Date(p.solvedAt).getHours();
    hours[h]++;
  });
  return hours.map((count, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    count,
  }));
};

// ─── Weakness Detection ───────────────────────────────────────────────────────
const computeWeaknesses = (problems) => {
  const topicMap = {};
  problems.forEach((p) => {
    p.topics.forEach((topic) => {
      if (!topicMap[topic]) topicMap[topic] = { topic, total: 0, unresolved: 0 };
      topicMap[topic].total++;
      if (p.status !== 'Solved') topicMap[topic].unresolved++;
    });
  });

  return Object.values(topicMap)
    .filter((t) => t.total >= 2)
    .map((t) => ({
      topic: t.topic,
      weaknessScore: Math.round((t.unresolved / t.total) * 100),
      total: t.total,
      unresolved: t.unresolved,
    }))
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);
};

// ─── Smart Recommendations ────────────────────────────────────────────────────
const computeRecommendations = (problems, user) => {
  const recommendations = [];
  const now = new Date();
  const last7 = problems.filter((p) => new Date(p.solvedAt) >= subDays(now, 7));

  // Topic gap: topics not covered in last 7 days
  const allTopics = [...new Set(problems.flatMap((p) => p.topics))];
  const recentTopics = new Set(last7.flatMap((p) => p.topics));
  const neglectedTopics = allTopics.filter((t) => !recentTopics.has(t));
  if (neglectedTopics.length > 0) {
    recommendations.push({
      type: 'topic_gap',
      icon: '🎯',
      title: `Revisit ${neglectedTopics[0]}`,
      message: `You haven't practiced ${neglectedTopics[0]} in over 7 days. A quick revision could help!`,
      priority: 'high',
    });
  }

  // Hard problem ratio
  const hardCount = last7.filter((p) => p.difficulty === 'Hard').length;
  if (last7.length > 5 && hardCount / last7.length < 0.2) {
    recommendations.push({
      type: 'difficulty',
      icon: '🔥',
      title: 'Challenge yourself more!',
      message: 'You\'ve been focusing on Easy/Medium. Try tackling a Hard problem today.',
      priority: 'medium',
    });
  }

  // Daily goal
  const todayCount = problems.filter(
    (p) => format(new Date(p.solvedAt), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
  ).length;
  if (todayCount === 0) {
    recommendations.push({
      type: 'daily_goal',
      icon: '⚡',
      title: "You haven't solved anything today!",
      message: `Your daily goal is ${user.dailyGoal || 3} problems. Get started now to maintain your streak!`,
      priority: 'high',
    });
  } else if (todayCount < (user.dailyGoal || 3)) {
    recommendations.push({
      type: 'daily_goal',
      icon: '💪',
      title: `${(user.dailyGoal || 3) - todayCount} more to go!`,
      message: `You've solved ${todayCount} problem(s) today. ${(user.dailyGoal || 3) - todayCount} more to hit your daily goal!`,
      priority: 'medium',
    });
  }

  // Revisit alert
  const revisitProblems = problems.filter((p) => p.status === 'Revisit').slice(0, 3);
  if (revisitProblems.length > 0) {
    recommendations.push({
      type: 'revisit',
      icon: '🔄',
      title: `${problems.filter((p) => p.status === 'Revisit').length} problems need revisiting`,
      message: `Start with "${revisitProblems[0].title}" to strengthen your understanding.`,
      priority: 'medium',
    });
  }

  // Streak protection
  const lastSolved = problems[0] ? new Date(problems[0].solvedAt) : null;
  if (lastSolved && differenceInCalendarDays(now, lastSolved) === 1) {
    recommendations.push({
      type: 'streak',
      icon: '🔗',
      title: 'Protect your streak!',
      message: "You haven't solved anything today. Solve at least 1 problem to keep your streak alive!",
      priority: 'high',
    });
  }

  return recommendations.slice(0, 4);
};

// ─── Recent Activity ──────────────────────────────────────────────────────────
const computeRecentActivity = (problems) => {
  return problems.slice(0, 10).map((p) => ({
    _id: p._id,
    title: p.title,
    platform: p.platform,
    difficulty: p.difficulty,
    status: p.status,
    topics: p.topics,
    solvedAt: p.solvedAt,
    timeTaken: p.timeTaken,
  }));
};

const emptyInsights = () => ({
  overview: { total: 0, solved: 0, revisit: 0, attempted: 0, avgTime: 0, totalTime: 0, todayCount: 0, last7Days: 0, solveRate: 0, targetProgress: 0, targetProblems: 100, dailyGoal: 3, dailyGoalProgress: 0 },
  streak: { current: 0, longest: 0, lastSolvedDate: null },
  heatmap: [],
  topicStats: [],
  difficultyDist: [],
  velocityData: [],
  platformDist: [],
  timeProductivity: [],
  weaknesses: [],
  recommendations: [],
  recentActivity: [],
});

module.exports = { getInsights };
