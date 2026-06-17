import { GitHubLoginButton } from '@/components/auth/github-login-button';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { DarkModeToggle } from '@/components/theme/dark-mode-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

const ACCOUNT_NOT_LINKED_ERROR = 'OAuthAccountNotLinked';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccountNotLinked = params?.error === ACCOUNT_NOT_LINKED_ERROR;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-sky-100 to-background dark:via-sky-950">
      <header className="flex items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <div className="inline-flex min-w-0 shrink-0 items-center gap-2">
          <Image
            src="/logos/techmate-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-8 w-auto dark:brightness-0 dark:invert sm:h-10"
            priority
          />
          <span className="font-lexend text-2xl sm:text-3xl">TechMate</span>
        </div>
        <div className="shrink-0">
          <DarkModeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-3 py-8 sm:p-8">
        <Card className="w-full max-w-sm -translate-y-4 gap-10 py-10 sm:-translate-y-8">
          <CardHeader className="text-center flex flex-col gap-5 items-center">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription className="break-keep">
              TechMate와 함께 기술 면접 준비를 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <GoogleLoginButton />
            <GitHubLoginButton />
            {isAccountNotLinked ? (
              <div
                role="alert"
                className="my-1 break-keep text-center rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                이미 같은 이메일로 가입된 계정이 있습니다. 처음 사용한 로그인
                방식으로 로그인해 주세요.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
