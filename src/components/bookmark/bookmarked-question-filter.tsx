'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function BookmarkedQuestionFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checked = searchParams.get('bookmarked') === '1';

  const onCheckedChange = (next: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    // 필터가 바뀌면 page는 1로 리셋
    params.set('page', '1');

    if (next) params.set('bookmarked', '1');
    else params.delete('bookmarked');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="bookmark-filter"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="bookmark-filter">북마크한 질문만 보기</Label>
    </div>
  );
}
