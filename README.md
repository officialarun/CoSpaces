# Fractional Land SPV Platform - India

A comprehensive, compliant web platform for fractional land investments through Special Purpose Vehicles (SPVs) in India.

## 🏗️ Project Overview

This platform enables investors to participate in land investments through legally-structured SPVs with full regulatory compliance including Companies Act, SEBI guidelines, RERA requirements, and PMLA/FIU regulations.

### Key Features

- **Full Compliance**: Built-in workflows for KYC/AML, private placement rules, RERA, and FEMA
- **SPV Management**: End-to-end SPV creation, incorporation, and lifecycle management
- **Investor Onboarding**: Automated KYC verification with Aadhaar, PAN, and AML screening
- **Subscription System**: Complete subscription workflow with escrow integration
- **Cap Table Management**: Automated share allocation and cap table tracking
- **Distribution Engine**: Pro-rata profit distribution with TDS calculation
- **Document Generation**: Automated legal document creation with eSign integration
- **Audit Trails**: Comprehensive logging of all financial and legal actions
- **Multi-Role Access**: Role-based access control for investors, compliance officers, asset managers, and administrators

## 📋 Regulatory Compliance

### Legal Framework

- **Companies Act 2013**: Private placement limits (max 200 investors per SPV)
- **SEBI Guidelines**: Compatible with AIF structure for scaling
- **RERA**: Built-in RERA applicability checks and compliance tracking
- **PMLA**: Mandatory KYC/AML procedures with FIU compliance
- **FEMA**: Foreign investor screening and approval workflows

### Key Compliance Features

- 180-day private placement restriction tracking
- Automated investor limit enforcement
- Sanctions and PEP screening
- Audit trail with 7+ year retention
- TDS calculation and deduction
- Beneficial ownership verification (>25%)

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT with MFA (TOTP)
- **Security**: Helmet, rate limiting, encryption (AES-256)
- **Logging**: Winston with structured logging

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: SWR for data fetching
- **Forms**: React Hook Form
- **UI Components**: Custom component library

### Infrastructure
- **Deployment**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Storage**: S3-compatible object storage
- **Email**: SendGrid integration
- **SMS**: Twilio/similar provider

## 📁 Project Structure

```
CoSpaces/
├── packages/
│   ├── backend/                 # Node.js API server (Port 5000)
│   │   ├── src/
│   │   │   ├── config/         # Database & app configuration
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── models/         # MongoDB models
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── services/       # Business logic & integrations
│   │   │   ├── utils/          # Helper functions
│   │   │   └── server.js       # App entry point
│   │   ├── scripts/           # Database seeds & utilities
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── frontend/               # User Dashboard - Next.js (Port 3000)
│   │   ├── components/         # React components
│   │   ├── lib/               # API client & utilities
│   │   ├── pages/             # Next.js pages
│   │   ├── styles/            # Global CSS
│   │   └── package.json
│   │
│   └── admin-frontend/         # Admin Console - Next.js (Port 3001)
│       ├── components/         # Admin UI components
│       ├── lib/               # Admin API client & auth
│       ├── pages/             # Admin dashboard pages
│       ├── styles/            # Admin styling
│       └── package.json
│
├── package.json               # Workspace root with dev scripts
├── README.md
├── DEV_COMMANDS.md            # Quick reference for all commands
├── DEPLOYMENT.md
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CoSpaces
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Backend (`packages/backend/.env`):
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   # Edit .env with your configuration
   ```

   Frontend (`packages/frontend/.env.local`):
   ```bash
   cp packages/frontend/.env.local.example packages/frontend/.env.local
   # Edit .env.local with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6
   ```

5. **Start development servers**

   Option 1 - Run all servers together (Recommended):
   ```bash
   npm run dev
   ```
   This starts backend, frontend, and admin console with color-coded output!

   Option 2 - Run servers separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend

   # Terminal 3 - Admin Console
   npm run dev:admin
   ```

6. **Access the application**
   - User Frontend: http://localhost:3000
   - Admin Console: http://localhost:3001
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

   **Default Admin Credentials:**
   - Email: `official.pandeyarun0600@gmail.com`
   - Password: `Admin@12345`
   - Or use Google OAuth with the same email

   See [DEV_COMMANDS.md](./DEV_COMMANDS.md) for all available commands.

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/signup          - Create new account
POST   /api/v1/auth/login           - Login
POST   /api/v1/auth/logout          - Logout
GET    /api/v1/auth/me              - Get current user
POST   /api/v1/auth/mfa/setup       - Setup MFA
POST   /api/v1/auth/mfa/verify      - Verify MFA
```

### KYC Endpoints

```
POST   /api/v1/kyc/submit           - Submit KYC
GET    /api/v1/kyc/status           - Get KYC status
PUT    /api/v1/kyc/:userId/approve  - Approve KYC (Compliance)
PUT    /api/v1/kyc/:userId/reject   - Reject KYC (Compliance)
```

### Project Endpoints

```
GET    /api/v1/projects/listed      - Get public projects
POST   /api/v1/projects             - Create project (Asset Manager)
GET    /api/v1/projects/:id         - Get project details
PUT    /api/v1/projects/:id/approve/legal - Legal approval
PUT    /api/v1/projects/:id/approve/compliance - Compliance approval
```

### SPV Endpoints

```
POST   /api/v1/spv                  - Create SPV
GET    /api/v1/spv/:id              - Get SPV details
GET    /api/v1/spv/:id/captable     - Get cap table
POST   /api/v1/spv/:id/publish-ppm  - Publish PPM
POST   /api/v1/spv/:id/incorporate  - Mark as incorporated
```

### Subscription Endpoints

```
POST   /api/v1/subscriptions        - Create subscription
GET    /api/v1/subscriptions/my-subscriptions - Get my subscriptions
POST   /api/v1/subscriptions/:id/sign-documents - Sign documents
PUT    /api/v1/subscriptions/:id/allocate-shares - Allocate shares
```

### Distribution Endpoints

```
POST   /api/v1/distributions/calculate - Calculate distribution
GET    /api/v1/distributions/my-distributions - Get my distributions
POST   /api/v1/distributions/:id/process-payments - Process payments
```

See full API documentation at `/docs/API.md`

## 👥 User Roles & Permissions

### Investor
- Complete KYC onboarding
- Browse and invest in projects
- View portfolio and statements
- Receive distributions

### Asset Manager
- Create and manage projects
- Create SPVs for projects
- Upload due diligence documents
- Manage property lifecycle

### Compliance Officer
- Review and approve KYC applications
- Verify AML screening results
- Approve/reject subscriptions
- Monitor compliance flags
- Access compliance dashboard

### Legal Officer
- Review legal documents
- Approve project listings
- Publish PPMs
- Manage legal approvals

### Admin
- Full platform access
- User management
- SPV incorporation
- Release escrow funds
- Process distributions
- System configuration

### Auditor (Read-only)
- View transactions
- Access audit logs
- Download reports
- View cap tables

## 🔒 Security Features

- **Encryption**: AES-256 for sensitive PII data
- **Authentication**: JWT with secure refresh tokens
- **MFA**: Time-based OTP for sensitive operations
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Express-validator on all inputs
- **SQL Injection**: Protected via Mongoose ORM
- **XSS Protection**: Helmet.js security headers
- **CORS**: Configured for frontend domain only
- **Audit Logging**: All critical actions logged
- **Session Management**: Automatic session expiry
- **Password Policy**: Minimum 8 characters, hashing with bcrypt

## ⚖️ Legal Safeguards

### Built-in Checks

1. **Investor Limit Enforcement**: Automatically blocks new subscriptions if SPV reaches 200 investors
2. **Private Placement Restrictions**: Tracks 180-day restriction period
3. **KYC/AML Verification**: Blocks investments without approved KYC
4. **FEMA Compliance**: Separate workflow for foreign investors
5. **RERA Applicability**: Project-level RERA determination
6. **Manual Overrides**: Legal officers can override automated checks

### Document Generation

- Private Placement Memorandum (PPM)
- Subscription Agreement
- Shareholder Agreement
- Board Resolutions
- Share Certificates
- Distribution Statements
- Tax Certificates (Form 16)

### Audit & Compliance

- 7-year audit log retention
- Immutable transaction records
- IP address and timestamp tracking
- Document version control
- eSign metadata capture

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:

- Docker configuration
- Kubernetes manifests
- Environment setup
- Database migrations
- Monitoring setup
- Backup procedures

### Quick Docker Deployment

```bash
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

See `.env.example` files in each package for required configuration.

Key configurations:
- Database connection
- JWT secrets
- Payment gateway credentials
- KYC provider API keys
- eSign provider credentials
- Email/SMS service credentials
- S3 storage configuration

## 📊 Monitoring & Observability

- **Application Logs**: Winston with structured JSON logging
- **Error Tracking**: Sentry integration
- **Metrics**: Prometheus exporters
- **Dashboards**: Grafana dashboards for key metrics
- **Health Checks**: `/health` endpoint
- **Audit Logs**: Queryable via `/api/v1/audit/logs`

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is proprietary software. All rights reserved.

## ⚠️ Disclaimer

**Legal Notice**: This platform facilitates securities transactions and must be operated in full compliance with applicable Indian securities laws. Consult with legal counsel before deployment.

**Investment Risk**: All investments carry risk. Past performance does not guarantee future results. Investors should carefully read all legal documents before investing.

## 🆘 Support

For technical support or questions:
- Email: support@fractionalland.com
- Documentation: https://docs.fractionalland.com
- Status Page: https://status.fractionalland.com

## 🗺️ Roadmap

- [ ] Secondary marketplace for share transfers
- [ ] Tokenization option (pending SEBI approval)
- [ ] Land registry integration
- [ ] Mobile apps (iOS/Android)
- [ ] Automated tax filing integration
- [ ] Advanced analytics dashboard
- [ ] REITs structure support

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

**Built with ❤️ for democratizing land investments in India**

