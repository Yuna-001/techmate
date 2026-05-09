import { PaginatedResponse } from './pagination';

export type QuestionDetailResponse = {
  content: string;
  createdAt: string;
  isBookmarked: boolean;
  tags: string[];
  idealAnswer: string;
};

export interface QuestionListItem {
  questionId: string;
  content: string;
  createdAt: string;
  isBookmarked: boolean;
  tags: string[];
}

export type QuestionListResponse = PaginatedResponse<QuestionListItem>;
