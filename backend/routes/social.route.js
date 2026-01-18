const express = require('express');
const auth = require('../middleware/auth');
const {
  createPost,
  listFeed,
  toggleLike,
  listComments,
  addComment,
  searchUsers,
  toggleFollow,
  listFollowing,
  listFollowers,
} = require('../controllers/social.controller');

const router = express.Router();

router.get('/posts', auth, listFeed);
router.post('/posts', auth, createPost);
router.post('/posts/:id/like', auth, toggleLike);
router.get('/posts/:id/comments', auth, listComments);
router.post('/posts/:id/comments', auth, addComment);

router.get('/users', auth, searchUsers);
router.post('/follow/:userId', auth, toggleFollow);
router.get('/following', auth, listFollowing);
router.get('/followers', auth, listFollowers);

module.exports = router;