const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../connectDB');
const seedRoles = require('./seedRoles');
const User = require('../../models/User');
const Role = require('../../models/Role');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const runAsScript = require.main === module;

const getEnv = (key) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const generatePassword = (length = 16) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  return Array.from({ length })
    .map(() => alphabet[crypto.randomInt(alphabet.length)])
    .join('');
};

async function seedAdminUser() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    await seedRoles();

    const email = (getEnv('ADMIN_SEED_EMAIL') || 'talelchaaanbi00@gmail.com').toLowerCase();
    const username = getEnv('ADMIN_SEED_USERNAME') || 'admin';
    const phone = getEnv('ADMIN_SEED_PHONE');
    const suppliedPassword = getEnv('ADMIN_SEED_PASSWORD');

    const adminRole = await Role.findOne({ lib: 'ADMIN' });
    if (!adminRole) {
      throw new Error('ADMIN role not found. Run role seeder first.');
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log('Admin user already exists. Skipping creation.');
      if (runAsScript) process.exit(0);
      return user;
    }

    const plainPassword = suppliedPassword || generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const userData = {
      username,
      email,
      password: hashedPassword,
      role: adminRole._id,
    };

    if (phone) {
      userData.phone = phone;
    }

    user = await User.create(userData);

    console.log('Admin user created successfully.');
    if (suppliedPassword) {
      console.log('Password sourced from ADMIN_SEED_PASSWORD environment variable.');
    } else {
      console.log(`Generated admin password: ${plainPassword}`);
    }

    if (runAsScript) process.exit(0);
    return user;
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    if (runAsScript) process.exit(1);
    else throw error;
  }
}

if (runAsScript) {
  seedAdminUser();
}

module.exports = seedAdminUser;
