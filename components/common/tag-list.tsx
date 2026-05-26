'use client';

import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type TagListProps = {
  tags: string[];
  onRemove?: (index: number) => void;
};

export function TagList({ tags, onRemove }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2 ">
      {tags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className="flex max-w-full cursor-default items-center justify-center gap-1 dark:border-border dark:bg-transparent dark:text-foreground"
        >
          <div className="truncate">{tag}</div>
          {onRemove && (
            <button
              type="button"
              aria-label={`${tag} 삭제`}
              onClick={() => onRemove(index)}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}
