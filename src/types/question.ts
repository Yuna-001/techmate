import type { PaginatedResponse } from './pagination';

export type QuestionDetailResponse = {
  content: string;
  exampleAnswer: string;
  createdAt: string;
  isBookmarked: boolean;
  tags: string[];
};

export type QuestionListItem = {
  questionId: string;
  content: string;
  createdAt: string;
  isBookmarked: boolean;
  tags: string[];
};

export type QuestionListResponse = PaginatedResponse<QuestionListItem>;
