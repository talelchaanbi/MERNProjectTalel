const nodemailer = require('nodemailer');

// Creates a transporter if SMTP env config is provided, otherwise returns null
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

const transporter = createTransporter();

async function sendVerificationEmail(to, token, userId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Provide a verification route that points to the frontend which will call the backend API
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verify?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}`;

  const subject = 'Confirmez votre adresse email';
  const text = `Bonjour,\n\nMerci de vous être inscrit. Cliquez sur le lien suivant pour vérifier votre adresse email:\n\n${verifyUrl}\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez ce message.`;
  const html = `<p>Bonjour,</p><p>Merci de vous être inscrit. Cliquez sur le lien suivant pour vérifier votre adresse email :</p><p><a href="${verifyUrl}">Vérifier mon adresse email</a></p><p>Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.</p>`;

  if (!transporter) {
    // No SMTP configured - log the verification link to console for development
    console.info('No SMTP configuration detected. Verification link: %s', verifyUrl);
    return { logged: true, verifyUrl };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });
  // Always log the verification link in server logs (helpful for development/debugging)
  try {
    console.info('Verification link (logged): %s', verifyUrl);
  } catch (e) {}
  return { info };
}

module.exports = { sendVerificationEmail };
