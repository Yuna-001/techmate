import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type IconTooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: 'bottom' | 'top' | 'right' | 'left' | undefined;
  align?: 'center' | 'start' | 'end' | undefined;
};

export function IconTooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
}: IconTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
