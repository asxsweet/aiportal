import mongoose from 'mongoose';

/**
 * Per spec: aiScore, teacherScore, feedback.
 * Extra fields support the existing client (breakdown + separate teacher text).
 */
const ratingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
    },
    aiScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    aiIdea: { type: Number },
    aiAlgorithm: { type: Number },
    aiTechnical: { type: Number },
    aiTools: { type: Number },
    /** AI / automated feedback text */
    feedback: {
      type: String,
      required: true,
    },
    teacherScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    /** Teacher-written feedback */
    teacherFeedback: {
      type: String,
      default: '',
    },
    finalScore: {
      type: Number,
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Rating = mongoose.model('Rating', ratingSchema);
