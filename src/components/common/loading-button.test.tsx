import { render, screen } from '@testing-library/react';
import { LoadingButton } from './loading-button';

describe('LoadingButton', () => {
  test('기본 상태면 children을 렌더링한다', () => {
    render(<LoadingButton>저장하기</LoadingButton>);

    expect(
      screen.getByRole('button', { name: '저장하기' }),
    ).toBeInTheDocument();
  });

  test('로딩 상태면 loadingText를 렌더링한다', () => {
    render(
      <LoadingButton isLoading loadingText="저장 중...">
        저장하기
      </LoadingButton>,
    );

    expect(
      screen.getByRole('button', { name: '저장 중...' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('저장하기')).not.toBeInTheDocument();
  });

  test('loadingText가 null이면 로딩 상태에서 스피너만 렌더링한다', () => {
    render(
      <LoadingButton isLoading loadingText={null} aria-label="저장 중">
        저장하기
      </LoadingButton>,
    );

    expect(screen.getByRole('button', { name: '저장 중' })).toBeDisabled();
    expect(screen.queryByText('처리 중...')).not.toBeInTheDocument();
    expect(screen.queryByText('저장하기')).not.toBeInTheDocument();
  });

  test('로딩 상태면 disabled 및 aria-busy가 적용된다', () => {
    render(<LoadingButton isLoading>저장하기</LoadingButton>);

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
