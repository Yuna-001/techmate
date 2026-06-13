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

export default function LoginPage() {
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
        <Card className="w-full max-w-sm py-10 gap-10 ">
          <CardHeader className="text-center flex flex-col gap-5 items-center">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription className="break-keep">
              TechMate와 함께 기술 면접 준비를 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 max-[250px]:flex-row max-[250px]:justify-around max-[250px]:mx-2">
            <GoogleLoginButton />
            <GitHubLoginButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
