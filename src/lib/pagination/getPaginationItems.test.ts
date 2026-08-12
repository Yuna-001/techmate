import { getPaginationItems, type PaginationToken } from './getPaginationItems';

const isNumber = (v: PaginationToken): v is number => typeof v === 'number';

const getNumbers = (items: PaginationToken[]) => items.filter(isNumber);

const findLeftNumber = (items: PaginationToken[], fromIndex: number) => {
  for (let j = fromIndex - 1; j >= 0; j--) {
    const v = items[j];
    if (isNumber(v)) return v;
  }
  return null;
};

const findRightNumber = (items: PaginationToken[], fromIndex: number) => {
  for (let j = fromIndex + 1; j < items.length; j++) {
    const v = items[j];
    if (isNumber(v)) return v;
  }
  return null;
};

const expectCommonInvariants = (
  items: PaginationToken[],
  totalPages: number,
) => {
  // 타입 안전: 값은 number | 'ellipsis'이어야 함
  for (const it of items) {
    expect(typeof it === 'number' || it === 'ellipsis').toBe(true);
  }

  // ellipsis는 최대 2개
  const ellipsisCount = items.filter((x) => x === 'ellipsis').length;
  expect(ellipsisCount).toBeLessThanOrEqual(2);

  // totalPages>=1이면 첫 페이지와 마지막 페이지를 포함
  if (totalPages >= 1) {
    expect(items).toContain(1);
    expect(items).toContain(totalPages);
  }

  // 숫자들은 중복 없음 + 범위 내 + 오름차순
  const nums = getNumbers(items);
  const unique = new Set(nums);

  // 중복 없음
  expect(unique.size).toBe(nums.length);

  // 범위 내
  for (const n of nums) {
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(totalPages);
  }

  // 오름차순
  for (let i = 1; i < nums.length; i++) {
    expect(nums[i]).toBeGreaterThan(nums[i - 1]);
  }

  // ellipsis는 맨 앞/맨 뒤에 오면 안 됨
  if (items.length > 0) {
    expect(items[0]).not.toBe('ellipsis');
    expect(items[items.length - 1]).not.toBe('ellipsis');
  }

  // ellipsis 주변은 실제로 "끊긴 구간"이어야 함 (좌/우 숫자 간격이 1 초과)
  for (let i = 0; i < items.length; i++) {
    if (items[i] !== 'ellipsis') continue;

    const left = findLeftNumber(items, i);
    const right = findRightNumber(items, i);

    expect(left).not.toBeNull();
    expect(right).not.toBeNull();

    // 실제로 중간 페이지가 생략된 경우여야 하므로 right - left > 1
    expect((right as number) - (left as number)).toBeGreaterThan(1);
  }
};

describe('getPaginationItems', () => {
  describe('총 페이지 수, 현재 페이지에 따른 페이지네이션 표시', () => {
    test.each([
      // 페이지 수가 적으면 ellipsis 없이 모든 페이지를 보여준다.
      { page: 1, totalPages: 1, expected: [1] },
      { page: 1, totalPages: 7, expected: [1, 2, 3, 4, 5, 6, 7] },
      { page: 4, totalPages: 7, expected: [1, 2, 3, 4, 5, 6, 7] },
      { page: 7, totalPages: 7, expected: [1, 2, 3, 4, 5, 6, 7] },

      // 초반 페이지에서는 앞쪽 연속 페이지와 마지막 페이지를 보여준다.
      { page: 1, totalPages: 8, expected: [1, 2, 3, 4, 5, 'ellipsis', 8] },
      { page: 4, totalPages: 8, expected: [1, 2, 3, 4, 5, 'ellipsis', 8] },
      { page: 1, totalPages: 10, expected: [1, 2, 3, 4, 5, 'ellipsis', 10] },
      { page: 2, totalPages: 10, expected: [1, 2, 3, 4, 5, 'ellipsis', 10] },
      { page: 3, totalPages: 10, expected: [1, 2, 3, 4, 5, 'ellipsis', 10] },
      { page: 4, totalPages: 10, expected: [1, 2, 3, 4, 5, 'ellipsis', 10] },

      // 중간 페이지에서는 현재 페이지 주변과 양 끝 페이지를 보여준다.
      {
        page: 5,
        totalPages: 10,
        expected: [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10],
      },
      {
        page: 6,
        totalPages: 10,
        expected: [1, 'ellipsis', 5, 6, 7, 'ellipsis', 10],
      },
      {
        page: 10,
        totalPages: 20,
        expected: [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20],
      },

      // 후반 페이지에서는 첫 페이지와 뒤쪽 연속 페이지를 보여준다.
      { page: 7, totalPages: 10, expected: [1, 'ellipsis', 6, 7, 8, 9, 10] },
      { page: 8, totalPages: 10, expected: [1, 'ellipsis', 6, 7, 8, 9, 10] },
      { page: 10, totalPages: 10, expected: [1, 'ellipsis', 6, 7, 8, 9, 10] },
      { page: 8, totalPages: 8, expected: [1, 'ellipsis', 4, 5, 6, 7, 8] },
    ])(
      'page=$page totalPages=$totalPages',
      ({ page, totalPages, expected }) => {
        expect(getPaginationItems(page, totalPages)).toEqual(expected);
      },
    );
  });

  describe('page가 1..totalPages 범위 밖인 경우', () => {
    test.each([
      {
        page: 0,
        totalPages: 10,
        expected: [1, 2, 3, 4, 5, 'ellipsis', 10],
      },
      {
        page: -3,
        totalPages: 10,
        expected: [1, 2, 3, 4, 5, 'ellipsis', 10],
      },
      {
        page: 11,
        totalPages: 10,
        expected: [1, 'ellipsis', 6, 7, 8, 9, 10],
      },
      {
        page: 99,
        totalPages: 10,
        expected: [1, 'ellipsis', 6, 7, 8, 9, 10],
      },
      {
        page: 0,
        totalPages: 7,
        expected: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        page: 8,
        totalPages: 7,
        expected: [1, 2, 3, 4, 5, 6, 7],
      },
    ])(
      'page=$page totalPages=$totalPages',
      ({ page, totalPages, expected }) => {
        const items = getPaginationItems(page, totalPages);
        expect(items).toEqual(expected);
        expectCommonInvariants(items, totalPages);
      },
    );
  });

  describe('항상 만족해야 하는 페이지네이션 규칙', () => {
    test('totalPages=7 이하에서는 ellipsis가 없어야 한다', () => {
      for (let totalPages = 1; totalPages <= 7; totalPages++) {
        for (let page = 1; page <= totalPages; page++) {
          const items = getPaginationItems(page, totalPages);
          expect(items.includes('ellipsis')).toBe(false);
          expectCommonInvariants(items, totalPages);
        }
      }
    });

    test('totalPages=20에서 모든 page(1..20)에 대해 불변조건을 만족한다', () => {
      const totalPages = 20;
      for (let page = 1; page <= totalPages; page++) {
        const items = getPaginationItems(page, totalPages);
        expectCommonInvariants(items, totalPages);
      }
    });

    test('totalPages=8(ellipsis가 존재하기 시작하는 구간)에서 모든 page(1..8)에 대해 불변조건을 만족한다', () => {
      const totalPages = 8;
      for (let page = 1; page <= totalPages; page++) {
        const items = getPaginationItems(page, totalPages);
        expectCommonInvariants(items, totalPages);
      }
    });
  });
});
