import { PaginatedResponse } from '@/types/pagination';

export interface AnswerListItem {
  answerId: string;
  content: string;
  score: number;
  createdAt: string;
}

export type AnswerListResponse = PaginatedResponse<AnswerListItem>;
