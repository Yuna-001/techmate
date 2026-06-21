import { PaginatedResponse } from './pagination';

export interface QuestionDetailCommonFields {
  content: string;
  exampleAnswer: string;
  isBookmarked: boolean;
  tags: string[];
}

export interface QuestionDetailResponse extends QuestionDetailCommonFields {
  createdAt: string;
}

export interface QuestionListItem {
  questionId: string;
  content: string;
  createdAt: string;
  isBookmarked: boolean;
  tags: string[];
}

export type QuestionListResponse = PaginatedResponse<QuestionListItem>;
