import mongoose from 'mongoose';

const tempmailSchema = new mongoose.Schema(
  {
    tempEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inbox:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inbox',
    }
  },
  { timestamps: true }
);

export const Tempmail = mongoose.model('Tempmail', tempmailSchema);
