import { formatCreatedAt } from './date';

describe('formatCreatedAt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-25T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('1분 미만이면 "방금 전"을 반환한다', () => {
    expect(formatCreatedAt('2026-05-25T11:59:30.000Z')).toBe('방금 전');
  });

  test('1시간 미만이면 분 단위 상대 시간을 반환한다', () => {
    expect(formatCreatedAt('2026-05-25T11:45:00.000Z')).toBe('15분 전');
  });

  test('1일 미만이면 시간 단위 상대 시간을 반환한다', () => {
    expect(formatCreatedAt('2026-05-25T09:00:00.000Z')).toBe('3시간 전');
  });

  test.each([
    ['2026-05-24T12:00:00.000Z', '1일 전'],
    ['2026-05-23T12:00:00.000Z', '2일 전'],
    ['2026-05-22T12:00:00.000Z', '3일 전'],
  ])('4일 미만이면 일 단위 상대 시간을 반환한다', (createdAt, expected) => {
    expect(formatCreatedAt(createdAt)).toBe(expected);
  });

  test('4일 이상이면 ko-KR 날짜 형식으로 반환한다', () => {
    const createdAt = '2026-05-21T12:00:00.000Z';
    const expected = new Date(createdAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    });

    expect(formatCreatedAt(createdAt)).toBe(expected);
  });
});
