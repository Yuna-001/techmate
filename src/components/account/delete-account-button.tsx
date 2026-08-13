'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { clientFetch } from '@/lib/fetch/client';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

export function DeleteAccountButton() {
  const handleDeleteAccount = async () => {
    try {
      const result = await clientFetch(`/api/me`, {
        method: 'DELETE',
        expectNoContent: true,
      });

      if (!result.ok) {
        toast.error('회원 탈퇴에 실패했습니다.');
        return;
      }

      signOut({ callbackUrl: '/login' });
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="hover:not-dark:border-destructive hover:not-dark:text-destructive hover:not-dark:bg-background hover:dark:bg-destructive hover:dark:border-destructive"
        >
          회원 탈퇴
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>회원 탈퇴를 진행하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription className="break-keep">
            탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            variant="destructive"
          >
            회원 탈퇴
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
