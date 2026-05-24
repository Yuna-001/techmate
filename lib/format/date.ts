export const formatCreatedAt = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) return '방금 전';
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 2) return '1일 전';
  if (diff < day * 3) return '2일 전';
  if (diff < day * 4) return '3일 전';

  return created.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
  });
};
