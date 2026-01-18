const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const Follow = require('../models/Follow');
const User = require('../models/User');
const { createNotification } = require('../utils/notify');

const createPost = async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ msg: 'content is required' });
    }
    const post = await Post.create({ author: req.userId, content: String(content).trim() });
    const populated = await Post.findById(post._id).populate('author', 'username email role profilePicture');
    res.status(201).json(populated);
  } catch (err) {
    console.error('createPost error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listFeed = async (req, res) => {
  try {
    const { q } = req.query || {};
    const filter = {};
    if (q && q.trim()) filter.$text = { $search: q.trim() };

    const posts = await Post.find(filter)
      .populate('author', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    console.error('listFeed error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const uid = String(req.userId);
    const index = post.likes.map((v) => String(v)).indexOf(uid);
    if (index >= 0) post.likes.splice(index, 1);
    else post.likes.push(req.userId);
    await post.save();
    if (index === -1 && String(post.author) !== String(req.userId)) {
      await createNotification({
        user: post.author,
        type: 'POST_LIKE',
        title: 'Nouveau like',
        body: 'Votre publication a reçu un like',
        link: '/app?view=social',
        metadata: { postId: post._id },
      });
    }
    res.json({ likesCount: post.likes.length, liked: index === -1 });
  } catch (err) {
    console.error('toggleLike error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listComments = async (req, res) => {
  try {
    const comments = await PostComment.find({ post: req.params.id })
      .populate('author', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    console.error('listComments error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ msg: 'content is required' });
    }
    const comment = await PostComment.create({
      post: req.params.id,
      author: req.userId,
      content: String(content).trim(),
    });
    const post = await Post.findById(req.params.id).select('author').lean();
    if (post && String(req.userId) !== String(post.author)) {
      await createNotification({
        user: post.author,
        type: 'POST_COMMENT',
        title: 'Nouveau commentaire',
        body: 'Quelqu’un a commenté votre publication',
        link: '/app?view=social',
        metadata: { postId: req.params.id, commentId: comment._id },
      });
    }
    const populated = await PostComment.findById(comment._id).populate('author', 'username email role profilePicture');
    res.status(201).json(populated);
  } catch (err) {
    console.error('addComment error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query || {};
    const filter = { deletedAt: null };
    if (q && q.trim()) {
      filter.$or = [
        { username: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
      ];
    }
    const users = await User.find(filter)
      .select('username email role profilePicture')
      .limit(20)
      .lean();
    res.json(users);
  } catch (err) {
    console.error('searchUsers error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (String(targetId) === String(req.userId)) {
      return res.status(400).json({ msg: 'Cannot follow yourself' });
    }
    const existing = await Follow.findOne({ follower: req.userId, following: targetId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ following: false });
    }
    await Follow.create({ follower: req.userId, following: targetId });
    res.json({ following: true });
  } catch (err) {
    console.error('toggleFollow error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.userId })
      .populate('following', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(follows.map((f) => f.following));
  } catch (err) {
    console.error('listFollowing error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.userId })
      .populate('follower', 'username email role profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    res.json(follows.map((f) => f.follower));
  } catch (err) {
    console.error('listFollowers error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createPost,
  listFeed,
  toggleLike,
  listComments,
  addComment,
  searchUsers,
  toggleFollow,
  listFollowing,
  listFollowers,
};