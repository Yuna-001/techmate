import mongoose, { Schema, Types } from 'mongoose';

export interface Feedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

interface AnswerDocument {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  content: string;
  feedback: Feedback | null;
  createdAt: Date;
}

const feedbackSchema = new Schema<Feedback>(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    strengths: {
      type: [String],
      required: true,
      default: [],
      set: (strengths: string[]) =>
        Array.isArray(strengths)
          ? strengths.map((s) => s.trim()).filter((s) => s.length > 0)
          : [],
    },
    improvements: {
      type: [String],
      required: true,
      default: [],
      set: (improvements: string[]) =>
        Array.isArray(improvements)
          ? improvements.map((s) => s.trim()).filter((s) => s.length > 0)
          : [],
    },
    missingKeywords: {
      type: [String],
      required: true,
      default: [],
      set: (keywords: string[]) =>
        Array.isArray(keywords)
          ? keywords.map((s) => s.trim()).filter((s) => s.length > 0)
          : [],
    },
  },
  {
    _id: false,
  },
);

const answerSchema = new Schema<AnswerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    feedback: {
      type: feedbackSchema,
      required: false,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default mongoose.models.Answer ||
  mongoose.model<AnswerDocument>('Answer', answerSchema);
