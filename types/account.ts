export type AccountProvider = 'github' | 'google';

export type AccountResponse = {
  provider: AccountProvider | null;
  createdAt: string | null;
};
