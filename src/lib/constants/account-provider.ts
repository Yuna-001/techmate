import type { AccountProvider } from '@/types/account';

export const PROVIDER_LABEL: Record<AccountProvider, string> = {
  google: 'Google',
  github: 'GitHub',
};

export const PROVIDERS = Object.keys(PROVIDER_LABEL) as AccountProvider[];
