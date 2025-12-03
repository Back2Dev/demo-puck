import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URI) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URI"');
}

const uri = process.env.DATABASE_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (uri.startsWith('file://')) {
  clientPromise = Promise.reject(new Error('Configured for file storage'));
  // Prevent unhandled rejection warning/error during module initialization
  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
