import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is required.');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  await client.connect();

  const questions = client.db().collection('questions');
  const result = await questions.updateMany(
    {
      idealAnswer: { $exists: true },
    },
    [
      {
        $set: {
          exampleAnswer: {
            $ifNull: ['$exampleAnswer', '$idealAnswer'],
          },
        },
      },
      {
        $unset: 'idealAnswer',
      },
    ],
  );

  console.log(
    `Migrated ${result.modifiedCount} question documents to exampleAnswer.`,
  );
} finally {
  await client.close();
}
