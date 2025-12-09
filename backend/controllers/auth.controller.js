//auth controller register et login
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');

//register controller
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, role} = req.body;
    let profilePicture = null;
     
    //profile picture ajout
    if (req.file) {
        profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }   

    //validate inputs

    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ msg: "Username, email, password and role are required" });
    }

    //check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    //role existence + normalization can be added here
    const normalizedRole = String(role || "")
      .trim()
      .toUpperCase();
    if (!normalizedRole) {
      return res.status(400).json({ msg: "Valid role is required" });
    }

    const foundRole = await Role.findOne({ lib: normalizedRole });
    if (!foundRole) {
      return res.status(400).json({ msg: "Role does not exist" });
    }

    //create new user
    user = new User({
      username,
      email,
      password,
      phone,
      role: foundRole._id,
      profilePicture,
    });

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
    res.status(500).send('Server error');
  }
};

//login controller
exports.login = async (req, res) => {
  try {
  } catch (error) {}
};

//current user controller
exports.currentUser = async (req, res) => {
  try {
  } catch (error) {}
};
