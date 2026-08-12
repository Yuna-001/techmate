import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookmarkedQuestionFilter } from './bookmarked-question-filter';

const pushMock = jest.fn();

let pathnameMock = '/';
let searchParamsMock = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}));

describe('BookmarkedQuestionFilter', () => {
  beforeEach(() => {
    pathnameMock = '/';
    searchParamsMock = new URLSearchParams();
  });

  test('bookmarked=1 쿼리가 있으면 스위치를 켠 상태로 렌더링한다', () => {
    // searchParams에 bookmarked=1 설정
    searchParamsMock = new URLSearchParams('bookmarked=1');

    render(<BookmarkedQuestionFilter />);

    const bookmarkFilterSwitch = screen.getByRole('switch', {
      name: '북마크한 질문만 보기',
    });

    expect(bookmarkFilterSwitch).toHaveAttribute('aria-checked', 'true');
  });

  test('bookmarked 쿼리가 없으면 스위치를 끈 상태로 렌더링한다', () => {
    render(<BookmarkedQuestionFilter />);

    const bookmarkFilterSwitch = screen.getByRole('switch', {
      name: '북마크한 질문만 보기',
    });

    expect(bookmarkFilterSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('스위치를 켜면 첫 페이지로 이동하며 북마크 필터를 적용한다', async () => {
    const user = userEvent.setup();

    pathnameMock = '/questions';
    searchParamsMock = new URLSearchParams('page=2');

    render(<BookmarkedQuestionFilter />);

    const bookmarkFilterSwitch = screen.getByRole('switch', {
      name: '북마크한 질문만 보기',
    });
    await user.click(bookmarkFilterSwitch);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/questions?page=1&bookmarked=1', {
      scroll: false,
    });
  });

  test('스위치를 끄면 첫 페이지로 이동하며 북마크 필터를 해제한다', async () => {
    const user = userEvent.setup();

    pathnameMock = '/questions';
    searchParamsMock = new URLSearchParams('page=2&bookmarked=1');

    render(<BookmarkedQuestionFilter />);

    const bookmarkFilterSwitch = screen.getByRole('switch', {
      name: '북마크한 질문만 보기',
    });

    await user.click(bookmarkFilterSwitch);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/questions?page=1', {
      scroll: false,
    });
  });
});
