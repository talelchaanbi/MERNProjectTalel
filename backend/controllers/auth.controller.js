//auth controller register et login
const { promises: fs } = require('fs');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const VerificationToken = require('../models/VerificationToken');
const { sendVerificationEmail } = require('../utils/mailer');

async function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch (err) {
    console.warn(`Unable to delete uploaded file ${file.path}: ${err.message}`);
  }
}

//register controller
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;
    let profilePicture;

    //profile picture ajout
    if (req.file) {
      profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    //validate inputs

    if (!username || !email || !password || !role) {
      await removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ msg: "Username, email, password and role are required" });
    }

    //check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ msg: "User already exists" });
    }
    //role existence + normalization can be added here
    const normalizedRole = String(role || "")
      .trim()
      .toUpperCase();
    if (!normalizedRole) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ msg: "Valid role is required" });
    }

    const foundRole = await Role.findOne({ lib: normalizedRole });
    if (!foundRole) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ msg: "Role does not exist" });
    }

    // Security: prevent creation of ADMIN users by unauthenticated/non-admin requests.
    // If the requester is authenticated and has role ADMIN (set by auth middleware), allow it.
    const requesterRole = String(req.userRole || req.session?.userRole || '').trim().toUpperCase();
    const isRequesterAdmin = requesterRole === 'ADMIN';
    if (foundRole.lib === 'ADMIN' && !isRequesterAdmin) {
      await removeUploadedFile(req.file);
      return res.status(403).json({ msg: 'Not authorized to create ADMIN users' });
    }

    //create new user (inactive until email verified)
    const userData = {
      username,
      email,
      password,
      phone,
      role: foundRole._id,
      isActive: false,
    };

    if (profilePicture) {
      userData.profilePicture = profilePicture;
    }

    user = new User(userData);

    //hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    //save user
    await user.save();

    // generate verification token and persist
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (1000 * 60 * 60 * 24)); // 24 hours
    await VerificationToken.create({ user: user._id, token, expiresAt });

    // send verification email (or log link if SMTP not configured)
    let mailResult = null;
    try {
      mailResult = await sendVerificationEmail(email, token, user._id.toString());
      // Log helpful info for operators: either the verifyUrl (when no transporter) or messageId
      if (mailResult?.verifyUrl) {
        console.info('Verification link (dev):', mailResult.verifyUrl);
      } else if (mailResult?.info) {
        console.info('Verification email sent, messageId:', mailResult.info.messageId);
        console.info('Mail accepted recipients:', mailResult.info.accepted);
      }
    } catch (err) {
      console.error('Error sending verification email:', err?.message || err);
      // continue - user can still be verified manually by admin
    }

    res.status(201).json({
      msg: "User registered successfully. Vérifiez votre email pour activer le compte.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: foundRole.lib,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error in registration:', error.message);
    await removeUploadedFile(req.file);
    res.status(500).send('Server error');
  }
};

//login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Account is disabled or email not verified' });
    }

    user.isOnline = true;
    await user.save();

    req.session.userId = user._id.toString();
    req.session.userRole = user.role?.lib;

    res.json({
      msg: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role?.lib,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).send('Server error');
  }
};

//current user controller
exports.currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('role');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role?.lib,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    res.status(500).send('Server error');
  }
};

// email verification handler
exports.verifyEmail = async (req, res) => {
  try {
    const { token, id } = req.query;
    if (!token || !id) return res.status(400).json({ msg: 'Token and id are required' });

    const v = await VerificationToken.findOne({ user: id, token });
    if (!v) {
      // If there's no token found, the token may have already been used.
      // Treat this case as idempotent: if the user is already active, return success.
      const maybeUser = await User.findById(id);
      if (maybeUser && maybeUser.isActive) {
        return res.json({ msg: 'Email verified successfully' });
      }
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    if (v.expiresAt < new Date()) {
      await VerificationToken.deleteOne({ _id: v._id });
      return res.status(400).json({ msg: 'Token expired' });
    }

    // activate user
    await User.findByIdAndUpdate(id, { isActive: true });
    // delete the token (single-use)
    await VerificationToken.deleteOne({ _id: v._id });

    return res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error('verifyEmail error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.isActive) return res.status(400).json({ msg: 'Account already active' });

    // remove any existing tokens for this user
    await VerificationToken.deleteMany({ user: user._id });

    // generate new token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (1000 * 60 * 60 * 24)); // 24 hours
    await VerificationToken.create({ user: user._id, token, expiresAt });

    // send email
    try {
      const mailResult = await sendVerificationEmail(email, token, user._id.toString());
      if (mailResult?.verifyUrl) console.info('Verification link (dev):', mailResult.verifyUrl);
      else if (mailResult?.info) console.info('Verification email sent, messageId:', mailResult.info.messageId);
    } catch (err) {
      console.error('Error sending verification email (resend):', err?.message || err);
    }

    return res.json({ msg: 'Verification email sent' });
  } catch (err) {
    console.error('resendVerification error:', err.message || err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

//logout controller
exports.logout = async (req, res) => {
  try {
    if (!req.session) {
      return res.status(400).json({ msg: 'No active session' });
    }

    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, { isOnline: false });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Server error');
      }

  res.clearCookie('sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      });

      return res.json({ msg: 'Logout successful' });
    });
  } catch (error) {
    console.error('Error during logout:', error.message);
    res.status(500).send('Server error');
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Optionally include soft-deleted users when query ?includeDeleted=true is provided
    // By default, soft-deleted users (deletedAt != null) are excluded from the list
    const includeDeleted = String(req.query.includeDeleted || '').toLowerCase() === 'true';

    const filter = { _id: { $ne: req.userId } };
    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    const users = await User.find(filter).populate('role', 'lib').select('-password');
    const formattedUsers = users.map(u => ({
      ...u.toObject(),
      role: u.role?.lib || 'UNKNOWN'
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update Profile (Self)
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    // Note: with multipart/form-data, fields may be empty strings; we explicitly read phone
    // from req.body even if it is an empty string so it can clear the phone on update.
    const phone = Object.prototype.hasOwnProperty.call(req.body, 'phone') ? req.body.phone : undefined;
    const currentPassword = Object.prototype.hasOwnProperty.call(req.body, 'currentPassword') ? req.body.currentPassword : undefined;
    const newPassword = Object.prototype.hasOwnProperty.call(req.body, 'newPassword') ? req.body.newPassword : undefined;
    const user = await User.findById(req.userId).populate('role');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Always update username/phone when provided in the request. This allows clearing values
    // by sending an empty string for the field.
    if (typeof username !== 'undefined') user.username = username;
    if (typeof phone !== 'undefined') user.phone = phone;
    console.debug(`updateProfile: received phone='${phone}' for user ${req.userId}`);

    // Handle password change for the current user: require currentPassword to change password
    if (typeof newPassword !== 'undefined') {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Current password is required to change your password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    
    if (req.file) {
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Admin can set a new password for the user without providing the old password
    if (typeof req.body.password !== 'undefined' && req.body.password) {
      // If admin is updating their own account via this endpoint, require currentPassword
      if (req.params.id.toString() === req.userId.toString()) {
        const currentPassword = req.body.currentPassword;
        if (!currentPassword) {
          return res.status(400).json({ msg: 'Current password is required to change your password' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: 'Current password is incorrect' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.lib,
        profilePicture: user.profilePicture,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err.message);
    await removeUploadedFile(req.file);
    res.status(500).send('Server Error');
  }
};

// Update User Status (Admin) - Soft Delete/Restore
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isActive = isActive;
    if (!isActive) {
      user.isOnline = false; // Force offline if deactivated
    }
    
    await user.save();
    res.json({ msg: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete User (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Perform a soft delete: mark user inactive and set deletedAt timestamp
    user.isActive = false;
    user.isOnline = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({ msg: 'User soft-deleted (deactivated) successfully', id: req.params.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update User by Admin
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { username, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    if (role) {
       const foundRole = await Role.findOne({ lib: role });
       if (foundRole) user.role = foundRole._id;
    }

    if (req.file) {
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Allow admin to set/reset a user's password. Support either 'password' or 'newPassword'.
    const incomingPassword = (typeof req.body.password !== 'undefined' && req.body.password)
      ? req.body.password
      : (typeof req.body.newPassword !== 'undefined' && req.body.newPassword)
        ? req.body.newPassword
        : null;

    if (incomingPassword) {
      // If admin is updating their own password via this admin endpoint, require currentPassword
      if (req.userId && req.userId.toString() === req.params.id.toString()) {
        const currentPassword = req.body.currentPassword;
        if (!currentPassword) {
          return res.status(400).json({ msg: 'Current password is required to change your password' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: 'Current password is incorrect' });
        }
      }

      console.debug(`Admin password change requested for user ${req.params.id}`);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(incomingPassword, salt);
    }

    await user.save();
    
    // Re-populate for response
    await user.populate('role');

    res.json({
      msg: 'User updated successfully',
      user: {
        ...user.toObject(),
        role: user.role?.lib
      }
    });
  } catch (err) {
    console.error(err.message);
    await removeUploadedFile(req.file);
    res.status(500).send('Server Error');
  }
};

// Get User By Id (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role').select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    res.json({
      ...user.toObject(),
      role: user.role?.lib
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
