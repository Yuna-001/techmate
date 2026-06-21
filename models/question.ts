import mongoose, { Schema, Types } from 'mongoose';

interface QuestionDocument {
  userId: Types.ObjectId;
  content: string;
  exampleAnswer: string;
  tags: string[];
  isBookmarked: boolean;
  lastActivityAt: Date;
  createdAt: Date;
}

const questionSchema = new Schema<QuestionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  exampleAnswer: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
    set: (tags: string[]) =>
      Array.from(
        new Set(
          tags
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0),
        ),
      ),
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    // 질문 생성 시점에 한 번 Date.now로 설정되고,
    // 이후에는 사용자가 이 질문에 답변을 추가/수정할 때만 코드에서 명시적으로 갱신
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.index({
  userId: 1,
  lastActivityAt: -1,
  createdAt: -1,
  _id: -1,
});

export default mongoose.models.Question ||
  mongoose.model<QuestionDocument>('Question', questionSchema);
