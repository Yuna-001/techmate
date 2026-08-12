import { DeleteAccountButton } from '@/components/account/delete-account-button';

export function DeleteAccountSection() {
  return (
    <section
      aria-labelledby="delete-account-title"
      className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <h2 id="delete-account-title" className="font-medium">
          회원 탈퇴
        </h2>
        <p className="text-sm text-muted-foreground break-keep">
          탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
      </div>
      <DeleteAccountButton />
    </section>
  );
}
