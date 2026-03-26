import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 5000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

commentSchema.index({ projectId: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
