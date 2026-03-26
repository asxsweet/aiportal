import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    /** Relative path under upload dir, or empty */
    fileUrl: {
      type: String,
      default: '',
    },
    attachmentOriginalName: {
      type: String,
      default: '',
    },
    tools: {
      type: [String],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length > 0 && v.every((t) => ['ev3', 'tinkercad'].includes(t));
        },
        message: 'tools must be a non-empty array of ev3 and/or tinkercad',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

assignmentSchema.index({ createdBy: 1, deadline: -1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
