import { render, screen, within } from '@testing-library/react';
import { AnswerList } from './answer-list';

jest.mock('@/components/answer/answer-preview-card', () => ({
  AnswerPreviewCard: ({
    questionId,
    answer,
  }: {
    questionId: string;
    answer: { answerId: string; content: string };
  }) => (
    <a href={`/questions/${questionId}/answers/${answer.answerId}`}>
      {answer.content}
    </a>
  ),
}));

const QUESTION_ID = 'question-1';

const ANSWERS = [
  {
    answerId: 'answer-1',
    content: '첫 번째 답변',
    score: 80,
    createdAt: '2026-05-25T00:00:00.000Z',
  },
  {
    answerId: 'answer-2',
    content: '두 번째 답변',
    score: 95,
    createdAt: '2026-05-25T01:00:00.000Z',
  },
];

describe('AnswerList', () => {
  test('items가 비어 있으면 빈 상태 문구를 렌더링한다', () => {
    render(<AnswerList questionId={QUESTION_ID} items={[]} />);

    expect(
      screen.getByText('아직 작성한 답변이 없습니다.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('items가 있으면 빈 상태 문구를 렌더링하지 않는다', () => {
    render(<AnswerList questionId={QUESTION_ID} items={ANSWERS} />);

    expect(
      screen.queryByText('아직 작성한 답변이 없습니다.'),
    ).not.toBeInTheDocument();
  });

  test('전달된 답변 개수만큼 목록 항목을 렌더링한다', () => {
    render(<AnswerList questionId={QUESTION_ID} items={ANSWERS} />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(ANSWERS.length);
  });

  test('각 답변 카드에 questionId와 answerId를 전달한다', () => {
    render(<AnswerList questionId={QUESTION_ID} items={ANSWERS} />);

    expect(screen.getByRole('link', { name: '첫 번째 답변' })).toHaveAttribute(
      'href',
      `/questions/${QUESTION_ID}/answers/answer-1`,
    );
    expect(screen.getByRole('link', { name: '두 번째 답변' })).toHaveAttribute(
      'href',
      `/questions/${QUESTION_ID}/answers/answer-2`,
    );
  });
});
