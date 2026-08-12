'use client';

import { IconTooltip } from '@/components/common/icon-tooltip';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggleMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <IconTooltip label="테마 전환">
      <Button
        variant="outline"
        size="icon"
        aria-label="테마 전환"
        onClick={handleToggleMode}
      >
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </IconTooltip>
  );
}
