export type AccountProvider = 'github' | 'google';

export type AccountLinkError =
  | 'AlreadyLinked'
  | 'AlreadyLinkedToCurrent'
  | 'LinkRequired'
  | 'LinkExpired';

export type AccountResponse = {
  providers: AccountProvider[];
  createdAt: string | null;
};
