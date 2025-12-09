const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../connectDB');
const Role = require('../../models/Role');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const roles = [
  {
    lib: 'ADMIN',
    permissions: 'manage:all',
    description: 'Full administrative access'
  },
  {
    lib: 'RECRUT',
    permissions: 'manage:recruitment',
    description: 'Recruitment team permissions'
  },
  {
    lib: 'CONSULTANT',
    permissions: 'access:consulting',
    description: 'Consultant level access'
  }
];

const runAsScript = require.main === module;

async function seedRoles() {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const existingCount = await Role.countDocuments();
    if (existingCount > 0) {
      console.log('Roles already seeded');
      if (runAsScript) process.exit(0);
      return;
    }

    await Role.insertMany(roles);
    console.log('Role seeding complete');
    if (runAsScript) process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error.message);
    if (runAsScript) process.exit(1);
    else throw error;
  }
}

if (runAsScript) {
  seedRoles();
}

module.exports = seedRoles;
