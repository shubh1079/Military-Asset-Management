# Military Asset Management System - MongoDB Edition

A comprehensive NoSQL-based web application for managing military assets, tracking movements, assignments, and expenditures across multiple bases with role-based access control.

## 🏗️ **Technology Stack**

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library

### Backend & Database
- **MongoDB**: NoSQL document database for flexible data modeling
- **Next.js API Routes**: RESTful API endpoints
- **JWT with JOSE**: Secure authentication tokens
- **bcryptjs**: Password hashing

## 🗄️ **MongoDB Schema Design**

### Collections Structure

#### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password_hash: String,
  role: "admin" | "base_commander" | "logistics_officer",
  base_id: ObjectId (ref: bases),
  full_name: String,
  created_at: Date,
  updated_at: Date
}
\`\`\`

#### Assets Collection
\`\`\`javascript
{
  _id: ObjectId,
  equipment_type_id: ObjectId (ref: equipment_types),
  base_id: ObjectId (ref: bases),
  serial_number: String,
  status: "available" | "assigned" | "maintenance" | "expended",
  condition: "excellent" | "good" | "fair" | "poor",
  metadata: {
    manufacturer: String,
    model: String,
    specifications: Object
  },
  created_at: Date,
  updated_at: Date
}
\`\`\`

#### Purchases Collection
\`\`\`javascript
{
  _id: ObjectId,
  base_id: ObjectId (ref: bases),
  equipment_type_id: ObjectId (ref: equipment_types),
  quantity: Number,
  unit_cost: Number,
  total_cost: Number,
  supplier: String,
  purchase_date: Date,
  purchase_order_number: String,
  created_by: ObjectId (ref: users),
  metadata: {
    delivery_date: Date,
    warranty_info: String,
    contract_details: Object
  },
  created_at: Date
}
\`\`\`

#### Transfers Collection
\`\`\`javascript
{
  _id: ObjectId,
  from_base_id: ObjectId (ref: bases),
  to_base_id: ObjectId (ref: bases),
  equipment_type_id: ObjectId (ref: equipment_types),
  quantity: Number,
  transfer_date: Date,
  reason: String,
  status: "pending" | "in_transit" | "completed" | "cancelled",
  requested_by: ObjectId (ref: users),
  approved_by: ObjectId (ref: users),
  tracking_info: {
    transport_method: String,
    estimated_arrival: Date,
    tracking_number: String
  },
  created_at: Date,
  completed_at: Date
}
\`\`\`

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- MongoDB 6.0+ (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd military-asset-management
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-super-secure-jwt-secret-key-must-be-at-least-32-characters-long
NODE_ENV=development
\`\`\`

For MongoDB Atlas:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/military_assets?retryWrites=true&w=majority
\`\`\`

4. **Seed the database**
\`\`\`bash
node scripts/seed-mongodb.js
\`\`\`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

6. **Access the application**
Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | admin | password | Full system access |
| Base Commander | cmd_alpha | password | Fort Alpha base access |
| Logistics Officer | log_alpha | password | Limited Fort Alpha access |

## 🔍 **MongoDB Advantages**

### Flexible Schema
- **Dynamic Fields**: Add metadata without schema migrations
- **Nested Documents**: Store complex asset specifications inline
- **Arrays**: Handle multiple values naturally (e.g., asset tags, categories)

### Powerful Aggregation
- **Complex Queries**: Multi-stage data processing pipelines
- **Real-time Analytics**: Dashboard metrics with aggregation framework
- **Joins**: $lookup operations for relational-style queries

### Scalability
- **Horizontal Scaling**: Sharding for large datasets
- **Replica Sets**: High availability and read scaling
- **Indexing**: Compound indexes for complex queries

### Example Aggregation Pipeline
\`\`\`javascript
// Dashboard metrics with equipment breakdown
db.purchases.aggregate([
  {
    $match: {
      base_id: ObjectId("..."),
      purchase_date: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $lookup: {
      from: "equipment_types",
      localField: "equipment_type_id",
      foreignField: "_id",
      as: "equipment"
    }
  },
  {
    $group: {
      _id: null,
      total_quantity: { $sum: "$quantity" },
      breakdown: {
        $push: {
          equipment_name: { $arrayElemAt: ["$equipment.name", 0] },
          quantity: "$quantity"
        }
      }
    }
  }
])
\`\`\`

## 📊 **Key Features**

### NoSQL Benefits
- **Flexible Data Models**: Easily adapt to changing requirements
- **Rich Metadata**: Store complex asset information without joins
- **Audit Trail**: Complete document history with timestamps
- **Geospatial Data**: Location tracking for mobile assets

### Performance Optimizations
- **Compound Indexes**: Multi-field query optimization
- **Aggregation Pipeline**: Server-side data processing
- **Connection Pooling**: Efficient database connections
- **Projection**: Return only required fields

### Data Relationships
\`\`\`javascript
// Asset with embedded equipment details
{
  _id: ObjectId("..."),
  equipment_type: {
    name: "M4A1 Carbine",
    category: "Weapons",
    specifications: {
      caliber: "5.56mm",
      weight: "3.4kg",
      effective_range: "500m"
    }
  },
  base_id: ObjectId("..."),
  serial_number: "M4-001",
  maintenance_history: [
    {
      date: Date("2024-01-15"),
      type: "routine",
      technician: "SGT Smith",
      notes: "Cleaned and inspected"
    }
  ]
}
\`\`\`

## 🔧 **Development**

### Database Operations
\`\`\`javascript
// Complex queries with MongoDB
const assetsNeedingMaintenance = await db.assets.find({
  "maintenance_history.date": {
    $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
  },
  status: "available"
})

// Aggregation for reporting
const utilizationReport = await db.assignments.aggregate([
  {
    $lookup: {
      from: "assets",
      localField: "asset_id",
      foreignField: "_id",
      as: "asset"
    }
  },
  {
    $group: {
      _id: "$asset.equipment_type_id",
      total_assignments: { $sum: 1 },
      avg_duration: { $avg: { $subtract: ["$return_date", "$assignment_date"] } }
    }
  }
])
\`\`\`

### Indexing Strategy
\`\`\`javascript
// Create performance indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.assets.createIndex({ base_id: 1, equipment_type_id: 1 })
db.purchases.createIndex({ base_id: 1, purchase_date: -1 })
db.transfers.createIndex({ from_base_id: 1, to_base_id: 1, transfer_date: -1 })
db.audit_logs.createIndex({ user_id: 1, created_at: -1 })

// Text search index
db.assets.createIndex({ 
  serial_number: "text", 
  "metadata.manufacturer": "text",
  "metadata.model": "text"
})
\`\`\`

## 🔒 **Security Features**

- **Role-Based Access Control**: MongoDB queries filtered by user permissions
- **Audit Logging**: Complete document change tracking
- **Data Validation**: Schema validation with MongoDB validators
- **Secure Authentication**: JWT tokens with MongoDB session storage

## 📈 **Monitoring & Analytics**

### Built-in Analytics
- **Real-time Dashboards**: Aggregation pipeline metrics
- **Asset Utilization**: Usage patterns and trends
- **Cost Analysis**: Purchase and maintenance cost tracking
- **Operational Reports**: Transfer efficiency and asset lifecycle

### MongoDB Compass Integration
- **Visual Query Builder**: GUI for complex queries
- **Performance Insights**: Index usage and query optimization
- **Schema Analysis**: Document structure visualization
- **Real-time Monitoring**: Database performance metrics

This MongoDB-based system provides the flexibility and scalability needed for modern military asset management while maintaining the security and audit requirements of defense operations.
