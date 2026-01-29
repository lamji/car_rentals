import { Db, MongoClient } from 'mongodb'

/**
 * MongoDB connection utility
 * Handles database connection and provides singleton instance
 */

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

/**
 * Initialize MongoDB connection lazily
 * @returns Promise<MongoClient> Client promise
 */
function initializeClient(): Promise<MongoClient> {
  // Use hardcoded MongoDB connection string
  const uri = 'mongodb://localhost:27017/'
  const options = {}

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    return globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    return client.connect()
  }
}

/**
 * Get MongoDB database instance
 * @returns Promise<Db> Database instance
 */
export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    clientPromise = initializeClient()
  }
  const client = await clientPromise
  return client.db('car-rentals') // Use car-rentals database
}

export default async function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = initializeClient()
  }
  return clientPromise
}
