//auth controller register et login
const { promises: fs } = require('fs');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');

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

    //create new user
    const userData = {
      username,
      email,
      password,
      phone,
      role: foundRole._id,
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
    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        
        email: user.email,
        role: foundRole.lib,
        profilePicture: user.profilePicture,

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
      return res.status(403).json({ msg: 'Account is disabled' });
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
        role: user.role?.lib,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    res.status(500).send('Server error');
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
    const users = await User.find().populate('role', 'lib').select('-password');
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
    const { username, phone } = req.body;
    const user = await User.findById(req.userId).populate('role');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (username) user.username = username;
    if (phone) user.phone = phone;
    
    if (req.file) {
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
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

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully', id: req.params.id });
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
