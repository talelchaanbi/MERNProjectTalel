const mongoose = require('mongoose');

// Password: '123456.' (decoded from 123456%2E)
const uri = 'mongodb://talelchaanbi00_db_user:123456.@ac-koxhpuj-shard-00-01.f6dpap2.mongodb.net:27017,ac-koxhpuj-shard-00-00.f6dpap2.mongodb.net:27017,ac-koxhpuj-shard-00-02.f6dpap2.mongodb.net:27017/mernproject?authSource=admin&ssl=true';

console.log('Testing connection with URI (password 123456.):', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
