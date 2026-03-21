const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // to serve HTML

app.post('/send-rating', async (req, res) => {
  const { rating } = req.body;

  // Replace with your email config
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'YOUR_EMAIL@gmail.com',
      pass: 'YOUR_APP_PASSWORD'  // Use App Password if 2FA
    }
  });

  let mailOptions = {
    from: 'YOUR_EMAIL@gmail.com',
    to: 'bhavanababu59@gmail.com',
    subject: 'New Website Rating',
    text: `A user rated your site ${rating} stars.'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Email failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
