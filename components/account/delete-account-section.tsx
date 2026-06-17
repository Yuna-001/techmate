import { DeleteAccountButton } from '@/components/account/delete-account-button';

export function DeleteAccountSection() {
  return (
    <div className="mt-8 flex flex-col items-start gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium">회원 탈퇴</p>
        <p className="text-sm text-muted-foreground break-keep">
          탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
      </div>
      <DeleteAccountButton />
    </div>
  );
}
