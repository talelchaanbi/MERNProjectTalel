require('dotenv').config();
const { sendVerificationEmail } = require('../utils/mailer');

async function run() {
  const to = process.env.TEST_MAIL_TO || process.env.SMTP_USER || 'test@example.com';
  const fakeToken = 'test-token-123';
  const fakeUserId = '000000000000000000000000';

  try {
    const result = await sendVerificationEmail(to, fakeToken, fakeUserId);
    console.log('sendVerificationEmail result:', result);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(1);
  }
}

run();
