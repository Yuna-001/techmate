import { render, screen } from '@testing-library/react';
import {
  CompactPagination,
  FullPagination,
  ResponsivePagination,
} from './responsive-pagination';

const makeHref = (page: number) => `/?page=${page}`;

const paginationVariants = [
  { name: 'CompactPagination', Component: CompactPagination },
  { name: 'FullPagination', Component: FullPagination },
] as const;

describe('ResponsivePagination', () => {
  test('totalPages가 1 이하이면 렌더하지 않는다', () => {
    const { container } = render(
      <ResponsivePagination page={1} totalPages={1} makeHref={makeHref} />,
    );

    expect(container.firstChild).toBeNull();
  });

  test('compact/full 래퍼를 반응형 클래스와 함께 렌더한다', () => {
    render(
      <ResponsivePagination page={1} totalPages={2} makeHref={makeHref} />,
    );

    const compact = screen.getByTestId('pagination-compact');
    const full = screen.getByTestId('pagination-full');

    expect(compact).toHaveClass('sm:hidden');
    expect(full).toHaveClass('hidden', 'sm:block');
  });
});

describe('CompactPagination', () => {
  test('현재 페이지와 전체 페이지 수를 표시한다', () => {
    render(<CompactPagination page={3} totalPages={10} makeHref={makeHref} />);

    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });
});

describe.each(paginationVariants)('$name 이전/다음 링크', ({ Component }) => {
  test('첫 페이지에서는 이전 링크가 비활성이고 첫 페이지 href를 가진다', () => {
    render(<Component page={1} totalPages={10} makeHref={makeHref} />);

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });

    expect(prevLink).toHaveAttribute('href', makeHref(1));
    expect(prevLink.closest('[aria-disabled="true"]')).not.toBeNull();
  });

  test('마지막 페이지에서는 다음 링크가 비활성이고 마지막 페이지 href를 가진다', () => {
    render(<Component page={10} totalPages={10} makeHref={makeHref} />);

    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    expect(nextLink).toHaveAttribute('href', makeHref(10));
    expect(nextLink.closest('[aria-disabled="true"]')).not.toBeNull();
  });

  test('중간 페이지에서는 이전/다음 링크가 인접 페이지 href를 가진다', () => {
    render(<Component page={5} totalPages={10} makeHref={makeHref} />);

    const prevLink = screen.getByRole('link', { name: /이전 페이지/ });
    const nextLink = screen.getByRole('link', { name: /다음 페이지/ });

    expect(prevLink).toHaveAttribute('href', makeHref(4));
    expect(nextLink).toHaveAttribute('href', makeHref(6));
  });
});

describe('FullPagination', () => {
  test('현재 페이지 링크를 active 상태로 렌더한다', () => {
    render(<FullPagination page={5} totalPages={10} makeHref={makeHref} />);

    const current = screen.getByRole('link', { name: '5' });

    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-active', 'true');
  });

  test('생략된 페이지 구간이 있으면 ellipsis를 렌더한다', () => {
    const { container } = render(
      <FullPagination page={15} totalPages={30} makeHref={makeHref} />,
    );

    const ellipses = container.querySelectorAll(
      '[data-slot="pagination-ellipsis"]',
    );
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
