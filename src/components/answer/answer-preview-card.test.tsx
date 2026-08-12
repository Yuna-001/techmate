import { formatCreatedAt } from '@/lib/format/date';
import { render, screen } from '@testing-library/react';
import { AnswerPreviewCard } from './answer-preview-card';

jest.mock('@/lib/format/date', () => ({
  formatCreatedAt: jest.fn(),
}));

const mockFormatCreatedAt = formatCreatedAt as jest.MockedFunction<
  typeof formatCreatedAt
>;

const QUESTION_ID = 'question-1';

const ANSWER = {
  answerId: 'answer-1',
  content: '테스트 답변입니다.',
  score: 85,
  createdAt: '2026-05-25T00:00:00.000Z',
};

describe('AnswerPreviewCard', () => {
  beforeEach(() => {
    mockFormatCreatedAt.mockReturnValue('1시간 전');
  });

  test('답변 상세 페이지 링크를 렌더링한다', () => {
    render(<AnswerPreviewCard questionId={QUESTION_ID} answer={ANSWER} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/questions/${QUESTION_ID}/answers/${ANSWER.answerId}`,
    );
  });

  test('답변 내용, 점수, 생성 시간을 렌더링한다', () => {
    render(<AnswerPreviewCard questionId={QUESTION_ID} answer={ANSWER} />);

    expect(screen.getByText(ANSWER.content)).toBeInTheDocument();
    expect(screen.getByText(`${ANSWER.score}점`)).toBeInTheDocument();
    expect(screen.getByText('1시간 전')).toBeInTheDocument();
  });

  test('createdAt 값을 포맷터에 전달한다', () => {
    render(<AnswerPreviewCard questionId={QUESTION_ID} answer={ANSWER} />);

    expect(mockFormatCreatedAt).toHaveBeenCalledTimes(1);
    expect(mockFormatCreatedAt).toHaveBeenCalledWith(ANSWER.createdAt);
  });
});
