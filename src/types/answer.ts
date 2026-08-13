import type { Feedback } from '@/models/answer';
import type { PaginatedResponse } from '@/types/pagination';

export type AnswerListItem = {
  answerId: string;
  content: string;
  score: number;
  createdAt: string;
};

export type AnswerListResponse = PaginatedResponse<AnswerListItem>;

export type AnswerDetailResponse = {
  content: string;
  feedback: Feedback;
};
