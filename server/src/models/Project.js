import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    tools: {
      type: [String],
      required: true,
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length > 0 && v.every((t) => ['ev3', 'tinkercad'].includes(t));
        },
        message: 'Invalid tools',
      },
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    /** Student who submitted */
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
  },
  { timestamps: true },
);

projectSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Project = mongoose.model('Project', projectSchema);
