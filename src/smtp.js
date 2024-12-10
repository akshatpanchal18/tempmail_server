import { SMTPServer } from 'smtp-server';
import mongoose from 'mongoose';
import { Inbox } from './Models/inbox.models.js';
import { Tempmail } from './Models/email.models.js';

const smtpServer = new SMTPServer({
  onConnect(session, cb) {
    console.log(`New SMTP connection: ${session.remoteAddress}`);
    cb(); // Accept the connection
  },

  onRcptTo(address, session, cb) {
    const emailId = address.address.split('@')[0]; // Extract username from email

    Tempmail.findOne({tempEmail:address.address})
    .then((emailid)=>{
      if(emailid){
        session.mailid = emailid.inbox
        cb()
      }else {
        cb(new Error('Recipient not found')); // Reject if not found
      }
    })
    .catch((err) => {
      console.error('Database error:', err);
      cb(new Error('Temporary server error'));
    });
    
    // Inbox.findOne({ emailId })
    //   .then((inbox) => {
    //     if (inbox) {
    //       session.inboxId = inbox._id; // Attach inbox ID to session
    //       cb(); // Accept recipient
    //     } else {
    //       cb(new Error('Recipient not found')); // Reject if not found
    //     }
    //   })
    //   .catch((err) => {
    //     console.error('Database error:', err);
    //     cb(new Error('Temporary server error'));
    //   });
  },

  onData(stream, session, cb) {
    let rawData = '';
    stream.on('data', (chunk) => {
      rawData += chunk.toString();
    });

    stream.on('end', () => {
      const inboxId = session.mailid;
      if (!inboxId) {
        return cb(new Error('No inbox found for the session'));
      }

      const email = parseEmail(rawData); // Parse email content
      Inbox.findById(inboxId)
        .then((inbox) => {
          inbox.messages.push({
            from: email.from,
            subject: email.subject,
            text: email.text,
            isRead: false,
            receivedAt: new Date(),
          });
          return inbox.save();
        })
        .then(() => {
          console.log('Email saved successfully');
          cb();
        })
        .catch((err) => {
          console.error('Error saving email:', err);
          cb(new Error('Failed to save email'));
        });
    });
  },

  disabledCommands: ['AUTH'], // Disable authentication for testing
});

// Helper to Parse Email
const parseEmail = (rawEmail) => {
  const fromMatch = rawEmail.match(/From: (.+)/i);
  const subjectMatch = rawEmail.match(/Subject: (.+)/i);
  const textStart = rawEmail.indexOf('\r\n\r\n');

  return {
    from: fromMatch ? fromMatch[1].trim() : 'unknown',
    subject: subjectMatch ? subjectMatch[1].trim() : 'No Subject',
    text: textStart !== -1 ? rawEmail.substring(textStart).trim() : 'No Content',
  };
};

// Start SMTP server on port 2525
export const startSMTPServer = () => {
  const PORT = process.env.SMTP_PORT || 587
  smtpServer.listen(PORT,'0.0.0.0', () => {
    console.log(`SMTP server running on port ${PORT}`);
  });
};
