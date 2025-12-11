module.exports = (...roles) => {
  const allowed = roles.map((role) => String(role || '').trim().toUpperCase()).filter(Boolean);

  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    const currentRole = String(req.userRole || req.session.userRole || '').trim().toUpperCase();
    if (!currentRole) {
      return res.status(403).json({ msg: 'Insufficient permissions' });
    }

    if (!allowed.includes(currentRole)) {
      return res.status(403).json({ msg: 'Insufficient permissions' });
    }

    next();
  };
};
