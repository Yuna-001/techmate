import type { Feedback } from '@/models/answer';
import { render, screen } from '@testing-library/react';
import { FeedbackSection } from './feedback-section';

const FEEDBACK: Feedback = {
  score: 85,
  summary: '핵심 내용을 잘 설명했습니다.',
  strengths: ['구체적인 예시를 들었습니다.'],
  improvements: ['결론을 더 명확히 작성해 주세요.'],
  missingKeywords: ['접근성'],
};

describe('FeedbackSection', () => {
  test('답변 점수를 스크린 리더용 텍스트로 제공한다', () => {
    render(<FeedbackSection feedback={FEEDBACK} />);

    expect(
      screen.getByText(`답변 점수: ${FEEDBACK.score}점 / 100점`),
    ).toHaveClass('sr-only');
    expect(screen.getByText(String(FEEDBACK.score))).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('/ 100점')).toHaveAttribute('aria-hidden', 'true');
  });
});
