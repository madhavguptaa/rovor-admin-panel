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

const globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, options).connect();
}

export async function getMongoDb(): Promise<Db> {
    const client = await globalForMongo._mongoClientPromise!;
    return client.db(dbName);
}

export {};
