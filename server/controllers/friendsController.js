const User = require('../models/User');
const Problem = require('../models/Problem');
const { format, differenceInCalendarDays, subDays } = require('date-fns');

// ─── Search for a user by username ────────────────────────────────────────────
const searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      _id: { $ne: req.user._id }, // exclude self
    }).select('username email createdAt');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if already a friend
    const isFriend = req.user.friends.some((fId) => fId.toString() === user._id.toString());
    res.json({ success: true, data: { ...user.toObject(), isFriend } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add a friend ─────────────────────────────────────────────────────────────
const addFriend = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const friend = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!friend) return res.status(404).json({ success: false, message: 'User not found' });
    if (friend._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot add yourself' });

    const alreadyFriend = req.user.friends.some((fId) => fId.toString() === friend._id.toString());
    if (alreadyFriend) return res.status(400).json({ success: false, message: 'Already in your friends list' });

    await User.findByIdAndUpdate(req.user._id, { $push: { friends: friend._id } });
    res.json({ success: true, message: `${friend.username} added to your friends!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Remove a friend ──────────────────────────────────────────────────────────
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } });
    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all friends with their stats ─────────────────────────────────────────
const getFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate('friends', 'username email createdAt');
    const friendsWithStats = await Promise.all(
      me.friends.map(async (friend) => {
        const problems = await Problem.find({ user: friend._id });
        const solved = problems.filter((p) => p.status === 'Solved').length;
        const streak = computeStreak(problems);
        return {
          _id: friend._id,
          username: friend.username,
          email: friend.email,
          totalSolved: problems.length,
          solved,
          streak: streak.current,
          longestStreak: streak.longest,
        };
      })
    );
    res.json({ success: true, data: friendsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Compare current user vs a friend ────────────────────────────────────────
const compareFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const friend = await User.findById(friendId).select('username email');
    if (!friend) return res.status(404).json({ success: false, message: 'Friend not found' });

    const [myProblems, friendProblems] = await Promise.all([
      Problem.find({ user: req.user._id }),
      Problem.find({ user: friendId }),
    ]);

    const buildStats = (problems, user) => {
      const diffDist = { Easy: 0, Medium: 0, Hard: 0 };
      const platformDist = {};
      const topicMap = {};
      problems.forEach((p) => {
        diffDist[p.difficulty]++;
        platformDist[p.platform] = (platformDist[p.platform] || 0) + 1;
        p.topics.forEach((t) => { topicMap[t] = (topicMap[t] || 0) + 1; });
      });

      const streak = computeStreak(problems);
      const last7 = problems.filter((p) => new Date(p.solvedAt) >= subDays(new Date(), 7)).length;

      return {
        username: user.username || user.email,
        total: problems.length,
        solved: problems.filter((p) => p.status === 'Solved').length,
        streak: streak.current,
        longestStreak: streak.longest,
        last7Days: last7,
        difficultyDist: Object.entries(diffDist).map(([name, value]) => ({ name, value })),
        platformDist: Object.entries(platformDist).map(([name, value]) => ({ name, value })),
        topTopics: Object.entries(topicMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic, count]) => ({ topic, count })),
      };
    };

    res.json({
      success: true,
      data: {
        me: buildStats(myProblems, req.user),
        friend: buildStats(friendProblems, friend),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Streak helper (shared) ───────────────────────────────────────────────────
const computeStreak = (problems) => {
  const uniqueDates = [
    ...new Set(problems.map((p) => format(new Date(p.solvedAt), 'yyyy-MM-dd'))),
  ].sort((a, b) => b.localeCompare(a));

  if (uniqueDates.length === 0) return { current: 0, longest: 0 };

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let currentStreak = 0;
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = differenceInCalendarDays(new Date(uniqueDates[i - 1]), new Date(uniqueDates[i]));
      if (diff === 1) currentStreak++;
      else break;
    }
  }

  let longest = 0, temp = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = differenceInCalendarDays(new Date(uniqueDates[i - 1]), new Date(uniqueDates[i]));
    if (diff === 1) temp++;
    else { longest = Math.max(longest, temp); temp = 1; }
  }
  longest = Math.max(longest, temp);

  return { current: currentStreak, longest };
};

module.exports = { searchUser, addFriend, removeFriend, getFriends, compareFriend };
