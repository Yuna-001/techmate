import { loadEnvConfig } from '@next/env';

const ensureOAuthIndexes = async () => {
  loadEnvConfig(process.cwd());

  const { default: client } = await import('../lib/db');

  try {
    const db = client.db();

    const pendingLinks = db.collection('pendingLinks');
    const accounts = db.collection('accounts');

    await Promise.all([
      pendingLinks.createIndex(
        { token: 1 },
        {
          unique: true,
          name: 'pendingLinks_token_unique',
        },
      ),
      pendingLinks.createIndex(
        { expiresAt: 1 },
        {
          expireAfterSeconds: 0,
          name: 'pendingLinks_expiresAt_ttl',
        },
      ),
      accounts.createIndex(
        { provider: 1, providerAccountId: 1 },
        {
          unique: true,
          name: 'accounts_provider_providerAccountId_unique',
        },
      ),
    ]);

    console.log('OAuth indexes are ready.');
  } finally {
    await client.close();
  }
};

ensureOAuthIndexes().catch((error) => {
  console.error('Failed to ensure OAuth indexes.', error);
  process.exitCode = 1;
});
