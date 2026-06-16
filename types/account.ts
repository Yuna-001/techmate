export type AccountProvider = 'github' | 'google';

export type AccountResponse = {
  providers: AccountProvider[];
  createdAt: string | null;
};
