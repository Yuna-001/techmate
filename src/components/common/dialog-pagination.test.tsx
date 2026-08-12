import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DialogCompactPagination,
  DialogFullPagination,
  DialogPagination,
} from './dialog-pagination';

const onPageChange = jest.fn();

const paginationVariants = [
  { name: 'DialogCompactPagination', Component: DialogCompactPagination },
  { name: 'DialogFullPagination', Component: DialogFullPagination },
] as const;

describe('DialogPagination', () => {
  test('totalPages가 1 이하이면 렌더링하지 않는다', () => {
    const { container } = render(
      <DialogPagination page={1} totalPages={1} onPageChange={onPageChange} />,
    );

    expect(container.firstChild).toBeNull();
  });

  test('compact/full 래퍼를 반응형 클래스와 함께 렌더링한다', () => {
    render(
      <DialogPagination page={1} totalPages={2} onPageChange={onPageChange} />,
    );

    const compact = screen.getByTestId('pagination-compact');
    const full = screen.getByTestId('pagination-full');

    expect(compact).toHaveClass('sm:hidden');
    expect(full).toHaveClass('hidden', 'sm:block');
  });
});

describe('DialogCompactPagination', () => {
  test('현재 페이지와 전체 페이지 수를 표시한다', () => {
    render(
      <DialogCompactPagination
        page={3}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });
});

describe.each(paginationVariants)('$name 이전/다음 버튼', ({ Component }) => {
  test('첫 페이지에서는 이전 버튼이 비활성화된다', () => {
    render(<Component page={1} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
  });

  test('마지막 페이지에서는 다음 버튼이 비활성화된다', () => {
    render(<Component page={10} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  });

  test('중간 페이지에서는 이전/다음 버튼이 인접 페이지로 이동을 요청한다', async () => {
    const user = userEvent.setup();

    render(<Component page={5} totalPages={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: '이전 페이지' }));
    await user.click(screen.getByRole('button', { name: '다음 페이지' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 6);
  });
});

describe('DialogFullPagination', () => {
  test('현재 페이지 버튼을 active 상태로 렌더링한다', () => {
    render(
      <DialogFullPagination
        page={5}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    const current = screen.getByRole('button', { name: '5페이지' });

    expect(current).toHaveAttribute('aria-current', 'page');
  });

  test('페이지 번호 버튼을 클릭하면 해당 페이지로 이동을 요청한다', async () => {
    const user = userEvent.setup();

    render(
      <DialogFullPagination
        page={5}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: '4페이지' }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test('생략된 페이지 구간이 있으면 ellipsis를 렌더링한다', () => {
    const { container } = render(
      <DialogFullPagination
        page={15}
        totalPages={30}
        onPageChange={onPageChange}
      />,
    );

    const ellipses = container.querySelectorAll(
      '[data-slot="pagination-ellipsis"]',
    );

    expect(ellipses.length).toBeGreaterThan(0);
  });
});
