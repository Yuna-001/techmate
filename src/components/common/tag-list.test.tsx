import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagList } from './tag-list';

const onRemove = jest.fn();

describe('TagList', () => {
  test('tags 배열의 각 항목을 렌더링한다', () => {
    render(<TagList tags={['React', 'TypeScript']} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  test('onRemove가 없으면 삭제 버튼을 렌더링하지 않는다', () => {
    render(<TagList tags={['React']} />);

    expect(
      screen.queryByRole('button', { name: /삭제/ }),
    ).not.toBeInTheDocument();
  });

  test('onRemove가 있으면 각 태그마다 삭제 버튼을 렌더링한다', () => {
    render(<TagList tags={['React', 'TypeScript']} onRemove={onRemove} />);

    expect(
      screen.getByRole('button', { name: /React 삭제/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /TypeScript 삭제/ }),
    ).toBeInTheDocument();
  });

  test('삭제 버튼을 클릭하면 해당 태그의 index로 onRemove를 호출한다', async () => {
    const user = userEvent.setup();

    render(<TagList tags={['React', 'TypeScript']} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'TypeScript 삭제' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
