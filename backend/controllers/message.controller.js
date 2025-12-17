const Message = require('../models/Message');
const { RequestValidationError } = require('./validations/validator');

const sanitize = (v) => (typeof v === 'string' ? v.trim() : v);

const validateMessage = (req) => {
  const body = req.body || {};
  const errors = [];

  const firstName = sanitize(body.firstName);
  if (!firstName) errors.push({ field: 'firstName', message: 'Le prénom est requis.' });

  const email = sanitize((body.email || '')).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) errors.push({ field: 'email', message: 'L\'email est requis.' });
  else if (!emailPattern.test(email)) errors.push({ field: 'email', message: 'Format d\'email invalide.' });

  const messageText = sanitize(body.message);
  if (!messageText) errors.push({ field: 'message', message: 'Le message est requis.' });

  const priority = sanitize(body.priority || 'normal').toLowerCase();
  if (!['normal', 'urgent'].includes(priority)) errors.push({ field: 'priority', message: 'Priority invalide.' });

  if (errors.length) throw new RequestValidationError(errors);

  req.body.firstName = firstName;
  req.body.lastName = sanitize(body.lastName || '');
  req.body.email = email;
  req.body.phone = sanitize(body.phone || '');
  req.body.organization = sanitize(body.organization || '');
  req.body.message = messageText;
  req.body.priority = priority;
};

const createMessage = async (req, res) => {
  validateMessage(req);
  const { firstName, lastName, email, phone, organization, message } = req.body;
  const { priority } = req.body;
  const doc = await Message.create({ firstName, lastName, email, phone, organization, message, priority });
  res.status(201).json({ msg: 'Message envoyé', id: doc._id });
};

const getCounts = async (req, res) => {
  const total = await Message.countDocuments();
  // be case-insensitive and tolerant if older docs have different casing
  const urgent = await Message.countDocuments({ priority: { $regex: /^urgent$/i } });
  const unread = await Message.countDocuments({ read: false });
  res.json({ total, urgent, unread });
};

const getMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  // normalize priority for consistency (ensure lowercase or default 'normal')
  const normalized = messages.map((m) => ({ ...m, priority: (m.priority || 'normal').toString().toLowerCase() }));
  res.json(normalized);
};

const getMessage = async (req, res) => {
  const { id } = req.params;
  const msg = await Message.findById(id).lean();
  if (!msg) return res.status(404).json({ msg: 'Non trouvé' });
  res.json(msg);
};

const markRead = async (req, res) => {
  const { id } = req.params;
  const msg = await Message.findById(id);
  if (!msg) return res.status(404).json({ msg: 'Non trouvé' });
  msg.read = true;
  await msg.save();
  res.json({ msg: 'Marqué comme lu' });
};

module.exports = {
  createMessage,
  getMessages,
  getMessage,
  markRead,
  getCounts,
};
