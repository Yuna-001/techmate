type AccountJoinedAtSectionProps = {
  joinedAt: string;
};

export function AccountJoinedAtSection({
  joinedAt,
}: AccountJoinedAtSectionProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-4">
      <p id="created-at-label" className="text-sm text-muted-foreground">
        가입일
      </p>
      <div aria-labelledby="created-at-label" className="font-medium text-sm">
        {joinedAt}
      </div>
    </div>
  );
}
