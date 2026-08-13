import type { AccountProvider } from '@/types/account';

export const PROVIDERS = ['google', 'github'] satisfies AccountProvider[];

export const PROVIDER_LABEL: Record<AccountProvider, string> = {
  google: 'Google',
  github: 'GitHub',
};
