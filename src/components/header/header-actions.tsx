import { LogoutButton } from '@/components/auth/logout-button';
import { MobileMenu } from '@/components/header/mobile-menu';
import { SettingMenu } from '@/components/header/setting-menu';
import { DarkModeToggle } from '@/components/theme/dark-mode-toggle';

export function HeaderActions() {
  return (
    <>
      <div className="hidden shrink-0 gap-4 sm:flex">
        <SettingMenu />
        <DarkModeToggle />
        <LogoutButton />
      </div>
      <MobileMenu />
    </>
  );
}
