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
  // During build time, environment variables might not be available
  // This prevents build errors while still allowing runtime connections
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    // If we're in a build context, return a rejected promise
    // This will be handled gracefully by the calling code
    return Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'))
  }

  const uri = mongoUri
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
