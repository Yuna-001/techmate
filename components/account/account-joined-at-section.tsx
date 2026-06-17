import { Label } from '@/components/ui/label';

type AccountJoinedAtSectionProps = {
  joinedAt: string;
};

export function AccountJoinedAtSection({
  joinedAt,
}: AccountJoinedAtSectionProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-4">
      <Label id="created-at-label" className="text-sm text-muted-foreground">
        가입일
      </Label>
      <div
        aria-labelledby="created-at-label"
        className="text-base font-medium md:text-sm"
      >
        {joinedAt}
      </div>
    </div>
  );
}
