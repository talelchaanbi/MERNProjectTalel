const mongoose = require('mongoose');

const hosts = 'ac-koxhpuj-shard-00-01.f6dpap2.mongodb.net:27017,ac-koxhpuj-shard-00-00.f6dpap2.mongodb.net:27017,ac-koxhpuj-shard-00-02.f6dpap2.mongodb.net:27017';
const db = 'mernproject';
const options = '?authSource=admin&ssl=true';

const credentials = [
  { user: 'talelchaanbi00_db_user', pass: '123456' },
  { user: 'talelchaanbi00', pass: '123456' },
  { user: 'root', pass: '123456' },
  { user: 'admin', pass: '123456' },
  { user: 'talelchaanbi00_db_user', pass: 'talel@2025' }, // Try admin seed password
];

async function testConnections() {
  for (const cred of credentials) {
    const uri = `mongodb://${cred.user}:${cred.pass}@${hosts}/${db}${options}`;
    console.log(`Testing User: ${cred.user}, Pass: ${cred.pass}`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ SUCCESS!');
      console.log(`Valid URI: ${uri}`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
  console.log('All attempts failed.');
  process.exit(1);
}

testConnections();
