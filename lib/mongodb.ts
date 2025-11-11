import { MongoClient, Db } from 'mongodb';

const options: Record<string, unknown> = {};
const dbName = process.env.MONGODB_DB;

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI environment variable');
    }

    if (db) {
        return db;
    }

    if (!client) {
        client = new MongoClient(uri, options);
    }

    if (!client.topology?.isConnected()) {
        await client.connect();
    }

    db = client.db(dbName || undefined);
    return db;
}

