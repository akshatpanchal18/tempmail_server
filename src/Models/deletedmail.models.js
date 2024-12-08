import mongoose from 'mongoose';

const deletedmailSchema = new mongoose.Schema(
  {
    inboxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inbox',
    },
    mailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tempmail',
    },
  },
  { timestamps: true }
);

export const DeletedMail = mongoose.model('DeletedMail', deletedmailSchema);
