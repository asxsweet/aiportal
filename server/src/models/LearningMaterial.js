import mongoose from 'mongoose';

const learningMaterialSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
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

learningMaterialSchema.index({ category: 1, createdAt: -1 });

export const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);