'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingText?: string | null;
};

export function LoadingButton({
  isLoading = false,
  loadingText = '처리 중...',
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || isLoading} aria-busy={isLoading} {...props}>
      {isLoading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText !== null && loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
