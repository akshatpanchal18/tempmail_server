import { SMTPServer } from 'smtp-server';
import mongoose from 'mongoose';
import { Inbox } from './Models/inbox.models.js';
import { Tempmail } from './Models/email.models.js';
import { simpleParser } from 'mailparser';

const smtpServer = new SMTPServer({
  onConnect(session, cb) {
    console.log(`New SMTP connection from: ${session.remoteAddress}`);
    cb(); // Accept connection
  },

  onRcptTo(address, session, cb) {
    Tempmail.findOne({ tempEmail: address.address })
      .then((emailid) => {
        if (emailid) {
          session.mailid = emailid.inbox; // Associate inbox ID
          cb(); // Accept recipient
        } else {
          cb(new Error('Recipient not found')); // Reject if not found
        }
      })
      .catch((err) => {
        console.error('Database error:', err);
        cb(new Error('Temporary server error')); // Fail gracefully
      });
  },

  onData(stream, session, cb) {
    const inboxId = session.mailid;
    if (!inboxId) return cb(new Error('No inbox found for the session'));

    simpleParser(stream)
      .then((email) => {
        return Inbox.findById(inboxId).then((inbox) => {
          if (!inbox) throw new Error('Inbox not found');
          inbox.messages.push({
            from: email.from.text,
            subject: email.subject || 'No Subject',
            text: email.text || 'No Content',
            isRead: false,
            receivedAt: new Date(),
          });
          return inbox.save();
        });
      })
      .then(() => {
        console.log('Email saved successfully');
        cb(); // Acknowledge success
      })
      .catch((err) => {
        console.error('Error saving email:', err);
        cb(new Error('Failed to process email'));
      });
  },

  disabledCommands: ['AUTH'], // Disable authentication for testing
});

// Start SMTP server
export const startSMTPServer = () => {
  const PORT = process.env.SMTP_PORT || 25; // Use 25 for incoming mail
  smtpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SMTP server running on port ${PORT}`);
  });
};
