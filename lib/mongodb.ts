import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const options: Record<string, unknown> = {};

if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
}

if (!dbName) {
    throw new Error('Missing MONGODB_DB environment variable');
}

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise =
    global._mongoClientPromise ??
    (async () => {
        const client = new MongoClient(uri, options);
        return client.connect();
    })();

if (!global._mongoClientPromise) {
    global._mongoClientPromise = clientPromise;
}

export async function getMongoDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db(dbName);
}

export {};
