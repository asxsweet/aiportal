import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 255,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['teacher', 'student'],
        message: '{VALUE} is not a valid role',
      },
    },
    institution: {
      type: String,
      trim: true,
      maxlength: 255,
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
      maxlength: 512,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'kz'],
      default: 'en',
    },
    notifications: {
      email: { type: Boolean, default: true },
      assignmentUpdates: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
