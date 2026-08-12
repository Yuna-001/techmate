export type PaginationToken = number | 'ellipsis';

export const getPaginationItems = (
  page: number,
  totalPages: number,
): PaginationToken[] => {
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const boundaryCount = 1; // 항상 보여줄 "맨 앞/맨 뒤" 페이지 개수
  const siblingCount = 1; // 현재 페이지 기준으로 좌우에 추가로 보여줄 페이지 개수

  /** [start..end] 숫자 배열 생성 */
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // --- 1) 페이지 수가 적으면 '...' 없이 전부 노출 ---
  const currentPageSlot = 1; // 현재 페이지 1칸
  const ellipsisSlots = 2; // 양쪽에 생길 수 있는 '...' 최대 칸 수

  // 페이지 수가 이 값 이하이면 '...' 없이 전체 노출(ellipsis 최대 2칸을 고려한 임계값)
  const minDisplayItems =
    boundaryCount * 2 + siblingCount * 2 + currentPageSlot + ellipsisSlots;

  if (totalPages <= minDisplayItems) {
    return range(1, totalPages);
  }

  // --- 2) 가운데 영역에서 실제로 보여줄 범위를 계산 ---
  // 가운데 영역 후보 범위: 양 끝 boundary 구간을 침범하지 않도록 제한
  const minMiddleStart = boundaryCount + 2;
  const maxMiddleEnd = totalPages - boundaryCount - 1;

  // 현재 페이지 기준으로 middle 범위를 잡되, 허용 범위를 넘지 않도록 범위 내로 제한
  const leftSibling = Math.max(currentPage - siblingCount, minMiddleStart);
  const rightSibling = Math.min(currentPage + siblingCount, maxMiddleEnd);

  // 가운데와 양 끝 사이에 생략 구간이 생기면 '...' 표시
  const showLeftEllipsis = leftSibling > minMiddleStart;
  const showRightEllipsis = rightSibling < maxMiddleEnd;

  // --- 3) 양 끝 고정 구간 ---
  const firstPages = range(1, boundaryCount);
  const lastPages = range(totalPages - boundaryCount + 1, totalPages);

  // --- 4) 케이스 분기: 초반 / 후반 / 중간 ---
  // 초반/후반에서는 '...'가 너무 빨리 나오지 않도록 한쪽을 조금 더 넓게 보여주는 보정값
  const edgeAdjacentPages = 2;
  const edgeRangeSpan = siblingCount * 2 + edgeAdjacentPages;

  // (초반) 왼쪽 ... 없음, 오른쪽 ... 있음
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRangeEnd = boundaryCount + edgeRangeSpan;
    const leftRange = range(1, leftRangeEnd);
    return [...leftRange, 'ellipsis', ...lastPages];
  }

  // (후반) 왼쪽 ... 있음, 오른쪽 ... 없음
  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeStart = totalPages - (boundaryCount + edgeRangeSpan) + 1;
    const rightRange = range(rightRangeStart, totalPages);
    return [...firstPages, 'ellipsis', ...rightRange];
  }

  // (중간) 양쪽 ... 있음
  const middleRange = range(leftSibling, rightSibling);
  return [...firstPages, 'ellipsis', ...middleRange, 'ellipsis', ...lastPages];
};
