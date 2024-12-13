import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  html:{
type:String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // attachments: {
  //   type: String, 
  // },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

const inboxSchema = new mongoose.Schema(
  {
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tempmail',
      required: true,
    },
    messages: {
      type: [messageSchema], 
      default: [],
    },
  },
  { timestamps: true }
);

export const Inbox = mongoose.model('Inbox', inboxSchema);
