const dns = require('dns');

const hostname = 'cluster0.f6dpap2.mongodb.net';
const user = 'talelchaanbi00_db_user';
const pass = 'eCd2A2abH2luc7x6';
const db = 'mernproject';

console.log(`Attempting to resolve ${hostname} using Google DNS (8.8.8.8)...`);

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.log('Could not set custom DNS servers:', e.message);
}

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
  if (err) {
    console.error('❌ SRV Resolution failed:', err.message);
    console.log('\nCannot automatically generate Direct URI. Please retrieve it from MongoDB Atlas dashboard.');
    return;
  }

  console.log('✅ SRV Records found:', addresses.length);
  const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');

  dns.resolveTxt(hostname, (err, records) => {
    let txtParams = '';
    if (err) {
      console.warn('⚠️ TXT Resolution failed (options like replicaSet might be missing):', err.message);
      // Fallback default for Atlas
      txtParams = 'replicaSet=atlas-unknown-shard-0&authSource=admin&ssl=true'; 
    } else {
      console.log('✅ TXT Records found');
      txtParams = records.flat().join('');
    }

    const directUri = `mongodb://${user}:${pass}@${hosts}/${db}?${txtParams}`;
    
    console.log('\nSUCCESS! Here is your Direct Connection URI:');
    console.log('---------------------------------------------------');
    console.log(directUri);
    console.log('---------------------------------------------------');
    console.log('\nAdd this to your backend/.env file as MONGO_URI_DIRECT=...');
  });
});
