const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchUser,
  addFriend,
  removeFriend,
  getFriends,
  compareFriend,
} = require('../controllers/friendsController');

router.use(protect);

router.get('/search', searchUser);          // GET  /api/friends/search?username=xxx
router.get('/', getFriends);               // GET  /api/friends
router.post('/add', addFriend);            // POST /api/friends/add  { username }
router.delete('/:friendId', removeFriend); // DEL  /api/friends/:friendId
router.get('/compare/:friendId', compareFriend); // GET /api/friends/compare/:friendId

module.exports = router;
