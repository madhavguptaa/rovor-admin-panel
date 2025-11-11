import { MongoClient, Db } from 'mongodb';

const options: Record<string, unknown> = {};

const globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
};

function assertValidEnv(variable: string | undefined, name: string) {
    if (!variable) {
        throw new Error(`Missing ${name} environment variable`);
    }
    const trimmed = variable.trim();
    if (!trimmed) {
        throw new Error(`${name} environment variable is empty`);
    }
    return trimmed;
}

export async function getMongoDb(): Promise<Db> {
    const uri = assertValidEnv(process.env.MONGODB_URI, 'MONGODB_URI');
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
        throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    }

    const dbName = assertValidEnv(process.env.MONGODB_DB, 'MONGODB_DB');

    if (!globalForMongo._mongoClientPromise) {
        globalForMongo._mongoClientPromise = new MongoClient(uri, options).connect();
    }

    const client = await globalForMongo._mongoClientPromise;
    return client.db(dbName);
}

export {};
