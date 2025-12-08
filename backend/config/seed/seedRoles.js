const path = require('path');
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

async function seedRoles() {
  try {
    await connectDB();

    for (const role of roles) {
      const exists = await Role.findOne({ lib: role.lib });
      if (exists) {
        console.log(`Role already exists: ${role.lib}`);
        continue;
      }
      await Role.create(role);
      console.log(`Created role: ${role.lib}`);
    }

    console.log('Role seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles;
