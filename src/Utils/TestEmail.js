// sendEmail.js
import nodemailer from 'nodemailer';

async function sendTestEmail() {
  // Create a transporter object using the specified SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'localhost', // Your SMTP server address
    port: 25,        // Your SMTP port (set to 2525)
    secure: false,
    tls: {
        rejectUnauthorized: false, // Ignore self-signed certificate
      },     // true for 465, false for other ports
  });

  // Send mail
  let info = await transporter.sendMail({
    from: '"Test User" test@example.com', // sender address
    // to: 'recipient@example.com',            // list of receivers
    to: 'test@temp.42web.io',            // list of receivers
    subject: 'Hello ',                     // Subject line
    text: 'Hello !! this is Test email',                    // plain text body              // html body
  });

  console.log('Message sent: %s', info.messageId);
}

export default sendTestEmail