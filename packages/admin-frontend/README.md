# Admin Console - Fractional Land SPV Platform

Administrative dashboard for managing users, projects, and KYC submissions.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Access at **http://localhost:3001**

## Features

- **User Management**: View, edit, and deactivate users
- **Project Management**: Publish, unpublish, and delete projects
- **KYC Management**: Review and approve/reject KYC submissions
- **Auto-refresh**: Updates every 30 seconds
- **Role-based Access**: Admin-only access

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Axios
- React Hot Toast
- React Icons

## Environment Variables

Create `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Project Structure

```
packages/admin-frontend/
├── pages/          # Next.js pages
├── components/     # React components
├── lib/            # API client & auth context
└── styles/         # Global styles
```

## Authentication

- Uses shared backend authentication
- Only `admin` role users can access
- JWT token stored in localStorage
- Auto-logout on token expiration

## Documentation

See root-level documentation:
- **ADMIN_CONSOLE_GUIDE.md** - Complete user guide
- **ADMIN_CONSOLE_QUICK_START.md** - Quick reference

## Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - Fractional Land SPV Platform

