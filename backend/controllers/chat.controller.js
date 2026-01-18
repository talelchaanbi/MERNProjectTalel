const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const { createNotification } = require('../utils/notify');

const getOrCreateThread = async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ msg: 'userId is required' });

    const participants = [String(req.userId), String(userId)].sort();
    let thread = await ChatThread.findOne({ participants: { $all: participants, $size: 2 } });
    if (!thread) {
      thread = await ChatThread.create({ participants, lastMessageAt: null });
    }
    const populated = await ChatThread.findById(thread._id).populate('participants', 'username email role profilePicture');
    res.json(populated);
  } catch (err) {
    console.error('getOrCreateThread error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listThreads = async (req, res) => {
  try {
    const threads = await ChatThread.find({ participants: req.userId })
      .populate('participants', 'username email role profilePicture')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();
    res.json(threads);
  } catch (err) {
    console.error('listThreads error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const listMessages = async (req, res) => {
  try {
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ msg: 'Thread not found' });
    if (!thread.participants.map(String).includes(String(req.userId))) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const messages = await ChatMessage.find({ thread: req.params.id })
      .populate('sender', 'username email role profilePicture')
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    console.error('listMessages error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ msg: 'content is required' });
    }
    const thread = await ChatThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ msg: 'Thread not found' });
    if (!thread.participants.map(String).includes(String(req.userId))) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const message = await ChatMessage.create({
      thread: req.params.id,
      sender: req.userId,
      content: String(content).trim(),
    });
    thread.lastMessageAt = new Date();
    await thread.save();

    const recipients = (thread.participants || []).filter((p) => String(p) !== String(req.userId));
    await Promise.all(
      recipients.map((uid) =>
        createNotification({
          user: uid,
          type: 'CHAT_MESSAGE',
          title: 'Nouveau message',
          body: 'Vous avez reçu un message',
          link: '/app?view=chat',
          metadata: { threadId: thread._id },
        })
      )
    );

    const populated = await ChatMessage.findById(message._id).populate('sender', 'username email role profilePicture');
    res.status(201).json(populated);
  } catch (err) {
    console.error('sendMessage error:', err.message || err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getOrCreateThread,
  listThreads,
  listMessages,
  sendMessage,
};