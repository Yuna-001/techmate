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
      <header className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/quervu-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-auto dark:brightness-0 dark:invert"
          />
          <span className="font-lexend text-3xl">Quervu</span>
        </div>
        <DarkModeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-sm py-10 gap-10 ">
          <CardHeader className="text-center flex flex-col gap-5 items-center">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription className="break-keep">
              Quervu와 함께 기술 면접 준비를 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <GoogleLoginButton />
            <GitHubLoginButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
