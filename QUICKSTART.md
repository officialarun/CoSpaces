# Quick Start Guide

Get the Fractional Land SPV Platform running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB installed OR Docker Desktop installed
- Git

## Option 1: Quick Start with Docker (Recommended)

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd CoSpaces
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 4. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill in the registration form
4. Login with your credentials
5. Complete KYC onboarding

### 5. Stop the Application

```bash
docker-compose down
```

To remove all data and start fresh:

```bash
docker-compose down -v
```

## Option 2: Manual Setup (Development)

### 1. Install Dependencies

```bash
cd CoSpaces
npm run install:all
```

### 2. Start MongoDB

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

**Or using local MongoDB:**
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb-community
```

### 3. Configure Environment

**Backend:**
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your settings (defaults work for local dev)
```

**Frontend:**
```bash
cd packages/frontend
cp .env.local.example .env.local
# Edit .env.local if needed
```

### 4. Start Development Servers

**Option A - Run both together:**
```bash
# From project root
npm run dev
```

**Option B - Run separately:**
```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Next Steps

### Create Admin User

To access admin features, you need to manually set a user's role to 'admin':

```bash
# Connect to MongoDB
mongosh

# Switch to database
use fractional-land-spv

# Find your user
db.users.find({ email: "your@email.com" })

# Update role to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Create Compliance Officer

```bash
mongosh
use fractional-land-spv
db.users.updateOne(
  { email: "compliance@example.com" },
  { $set: { role: "compliance_officer" } }
)
```

### Create Asset Manager

```bash
mongosh
use fractional-land-spv
db.users.updateOne(
  { email: "manager@example.com" },
  { $set: { role: "asset_manager" } }
)
```

## Default User Roles

After signup, all users have role: `investor`

To test different workflows, create multiple accounts and assign different roles:

- **investor**: Can invest in projects, view portfolio
- **asset_manager**: Can create projects and SPVs
- **compliance_officer**: Can approve KYC and subscriptions
- **legal_officer**: Can approve legal documents
- **admin**: Full access to all features
- **auditor**: Read-only access to audit logs

## Testing the Complete Flow

### 1. As Asset Manager

1. Login as asset manager
2. Go to `/admin/projects/create`
3. Create a new land project with details
4. Upload due diligence documents
5. Submit for approvals

### 2. As Compliance Officer

1. Login as compliance officer
2. Go to `/admin/projects`
3. Review and approve the project
4. Go to `/admin/kyc`
5. Approve pending KYC applications

### 3. As Admin

1. Login as admin
2. Create SPV for the approved project
3. Publish PPM
4. Mark SPV as "fundraising_open"

### 4. As Investor

1. Login as investor
2. Complete KYC if not done
3. Browse projects at `/projects`
4. Subscribe to an SPV
5. Sign documents
6. Upload payment proof
7. Wait for admin to confirm payment
8. View your investment in dashboard

### 5. Distribution Flow (Admin)

1. When ready to exit:
2. Admin creates distribution
3. Calculates pro-rata amounts
4. Gets approvals
5. Processes payments
6. Investors receive distributions

## Sample Data

### Create Sample Project (MongoDB)

```javascript
mongosh
use fractional-land-spv

// Get your asset manager user ID
const assetManager = db.users.findOne({ role: "asset_manager" })._id

// Insert sample project
db.projects.insertOne({
  projectName: "Prime Commercial Land - Whitefield",
  projectCode: "PROJ001",
  description: "5-acre commercial land parcel in Whitefield, Bangalore with excellent connectivity and high appreciation potential",
  shortDescription: "5-acre commercial land in Bangalore's tech hub",
  landDetails: {
    location: {
      address: "Whitefield Main Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      coordinates: { latitude: 12.9698, longitude: 77.7499 }
    },
    totalArea: { value: 217800, unit: "sqft" },
    landType: "commercial",
    surveyNumber: "123/4"
  },
  financials: {
    landValue: 250000000,
    targetRaise: 200000000,
    minimumInvestment: 500000,
    expectedIRR: { low: 12, high: 18, target: 15 },
    holdingPeriod: 36,
    exitStrategy: "resale"
  },
  status: "listed",
  isPublic: true,
  assetManager: assetManager,
  createdBy: assetManager,
  createdAt: new Date()
})
```

## Common Issues

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps

# Or
sudo systemctl status mongod

# Restart MongoDB
docker restart mongodb
# Or
sudo systemctl restart mongod
```

### Cannot Install Dependencies

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## API Testing with cURL

### Health Check

```bash
curl http://localhost:5000/health
```

### Signup

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+911234567890",
    "password": "securepass123",
    "userType": "individual",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'
```

### Get Projects (with token)

```bash
curl http://localhost:5000/api/v1/projects/listed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development Tips

### Enable Hot Reload

Both frontend and backend support hot reload in development mode.

### View Logs

**Docker:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

**Manual:**
```bash
# Backend logs
tail -f packages/backend/logs/combined.log

# Frontend console output in terminal
```

### Database GUI

Use MongoDB Compass to view/edit database:
- Download from: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`

### API Testing

Use Postman or Insomnia:
- Import API endpoints from `docs/api-collection.json`
- Or use the provided cURL commands

## Production Deployment

For production deployment, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [README.md](./README.md) - Full documentation

## Getting Help

- **Documentation**: Check README.md
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord/Slack
- **Email**: support@fractionalland.com

## What's Next?

1. Read the [Full README](./README.md) for detailed features
2. Check [API Documentation](./docs/API.md) for all endpoints
3. Review [Compliance Guide](./docs/COMPLIANCE.md) for regulatory requirements
4. See [Architecture](./docs/ARCHITECTURE.md) for system design

---

**Happy Building! 🚀**

