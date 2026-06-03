import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'first_project',
        'three_projects',
        'five_projects',
        'ten_projects',
        'high_score',
        'excellent_score',
        'algorithm_master',
        'presentation_pro',
        'problem_solver',
        'innovation_star',
        'safety_first',
        'early_bird',
        'perfect_score',
        'streak_three',
      ],
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

badgeSchema.index({ userId: 1, type: 1 }, { unique: true });

export const Badge = mongoose.model('Badge', badgeSchema);