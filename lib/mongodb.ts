import { MongoClient, type Db, type Collection } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Database interface
export class Database {
  private db: Db

  constructor(db: Db) {
    this.db = db
  }

  // Users collection
  get users(): Collection {
    return this.db.collection("users")
  }

  // Bases collection
  get bases(): Collection {
    return this.db.collection("bases")
  }

  // Equipment types collection
  get equipmentTypes(): Collection {
    return this.db.collection("equipment_types")
  }

  // Assets collection
  get assets(): Collection {
    return this.db.collection("assets")
  }

  // Purchases collection
  get purchases(): Collection {
    return this.db.collection("purchases")
  }

  // Transfers collection
  get transfers(): Collection {
    return this.db.collection("transfers")
  }

  // Assignments collection
  get assignments(): Collection {
    return this.db.collection("assignments")
  }

  // Expenditures collection
  get expenditures(): Collection {
    return this.db.collection("expenditures")
  }

  // Audit logs collection
  get auditLogs(): Collection {
    return this.db.collection("audit_logs")
  }
}

// Get database instance
export async function getDatabase(): Promise<Database> {
  const client = await clientPromise
  const db = client.db("military_assets")
  return new Database(db)
}

// Export the clientPromise for use in other parts of the app
export default clientPromise
