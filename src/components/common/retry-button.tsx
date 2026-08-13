'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type RetryButtonProps = {
  title: string;
  description?: string;
};

export function RetryButton({ title, description }: RetryButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-sm:flex-col gap-4 justify-center items-center">
      <div className="flex flex-col justify-center gap-2">
        <p className="font-medium text-center break-keep">{title}</p>
        {description && (
          <p
            className="text-center text-sm text-muted-foreground break-keep"
            data-testid="description"
          >
            {description}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        onClick={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
        aria-label="재시도"
        disabled={isPending}
      >
        <RefreshCcw
          className={`${isPending ? 'animate-spin direction-[reverse] animation-duration-[0.5s]' : ''}`}
        />
      </Button>
    </div>
  );
}
