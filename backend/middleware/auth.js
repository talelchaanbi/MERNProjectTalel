module.exports = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  req.userId = req.session.userId;
  req.userRole = req.session.userRole;
  next();
};
