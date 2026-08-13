import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetryButton } from './retry-button';

const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe('RetryButton', () => {
  test('title을 렌더링한다', () => {
    render(<RetryButton title="불러오기에 실패했습니다." />);

    expect(screen.getByText('불러오기에 실패했습니다.')).toBeInTheDocument();
  });

  test('description이 있으면 함께 렌더링한다', () => {
    render(
      <RetryButton
        title="불러오기에 실패했습니다."
        description="잠시 후 다시 시도해주세요."
      />,
    );

    expect(screen.getByText('불러오기에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해주세요.')).toBeInTheDocument();
  });

  test('description이 없으면 렌더링하지 않는다', () => {
    render(<RetryButton title="불러오기에 실패했습니다." />);

    expect(screen.queryByTestId('description')).not.toBeInTheDocument();
  });

  test('aria-label이 재시도인 버튼을 렌더링한다', () => {
    render(<RetryButton title="불러오기에 실패했습니다." />);

    expect(screen.getByRole('button', { name: '재시도' })).toBeInTheDocument();
  });

  test('재시도 버튼을 클릭하면 router.refresh를 호출한다', async () => {
    const user = userEvent.setup();

    render(<RetryButton title="불러오기에 실패했습니다." />);

    await user.click(screen.getByRole('button', { name: '재시도' }));

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
