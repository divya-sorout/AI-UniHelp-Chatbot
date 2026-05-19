const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');

// Add nodemailer require if not present
if (!content.includes('require("nodemailer")')) {
    content = content.replace(
        'const { GoogleGenerativeAI } = require("@google/generative-ai");',
        'const { GoogleGenerativeAI } = require("@google/generative-ai");\nconst nodemailer = require("nodemailer");'
    );
}

const newFunctions = `
exports.sendOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  try {
      await db.collection('otps').doc(email.toLowerCase()).set({ otp, expiresAt });

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      const mailOptions = {
          from: \`"UniHelp Admin" <\${process.env.EMAIL_USER}>\`,
          to: email,
          subject: 'Your UniHelp Login OTP',
          html: \`<h3>Your One-Time Password is: <b style="color:#6366f1;">\${otp}</b></h3><p>This code will expire in 5 minutes.</p>\`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: 'Failed to send email. Check credentials.' });
  }
});

exports.verifyOtp = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
  }

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
      const docRef = db.collection('otps').doc(email.toLowerCase());
      const doc = await docRef.get();

      if (!doc.exists) {
          return res.status(400).json({ error: 'No OTP found. Request a new one.' });
      }

      const data = doc.data();
      if (Date.now() > data.expiresAt) {
          return res.status(400).json({ error: 'OTP has expired. Request a new one.' });
      }

      if (data.otp === otp.toString().trim()) {
          await docRef.delete();
          return res.json({ success: true, message: 'OTP verified successfully' });
      } else {
          return res.status(400).json({ error: 'Invalid OTP. Try again.' });
      }
  } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
`;

if (!content.includes('exports.sendOtp')) {
    content += newFunctions;
    fs.writeFileSync('index.js', content);
    console.log('Successfully appended OTP functions');
} else {
    console.log('OTP functions already exist');
}
