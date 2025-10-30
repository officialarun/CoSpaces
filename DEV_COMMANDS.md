# Development Commands Reference

This document provides quick reference for all development commands in this project.

## 🚀 Quick Start - Single Command

From the **root directory**, run:

```bash
npm run dev
```

This will start **all three servers** simultaneously:
- 🔵 **Backend** (Port 5000) - API Server
- 🟣 **Frontend** (Port 3000) - User Dashboard
- 🟢 **Admin** (Port 3001) - Admin Console

Each server's output will be color-coded in your terminal for easy identification!

---

## 📦 Installation Commands

### Install All Dependencies
```bash
npm run install:all
```
Installs dependencies for root, backend, frontend, and admin-frontend.

---

## 🛠️ Development Commands

### Start All Servers
```bash
npm run dev
```
Starts backend, frontend, and admin-frontend concurrently with color-coded output.

### Start Individual Servers
```bash
# Backend only (Port 5000)
npm run dev:backend

# Frontend only (Port 3000)
npm run dev:frontend

# Admin Console only (Port 3001)
npm run dev:admin
```

---

## 🏗️ Build Commands

### Build All
```bash
npm run build
```
Builds backend, frontend, and admin-frontend for production.

### Build Individual
```bash
npm run build:backend
npm run build:frontend
npm run build:admin
```

---

## 🚢 Production Commands

### Start All (Production)
```bash
npm run start:backend
npm run start:frontend
npm run start:admin
```

---

## 🌐 Access URLs

Once all servers are running:

- **Backend API**: http://localhost:5000
- **User Frontend**: http://localhost:3000
- **Admin Console**: http://localhost:3001

---

## 📝 Notes

- The `npm run dev` command uses `concurrently` to run all servers in parallel
- Output is color-coded: Blue (backend), Magenta (frontend), Green (admin)
- Press `Ctrl+C` to stop all servers
- Logs from all servers appear in the same terminal window

---

## 🔧 Troubleshooting

### Port Already in Use
If you see "port already in use" errors:
1. Stop all running servers (`Ctrl+C`)
2. Check for lingering processes:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```
3. Kill the processes if needed

### Dependencies Missing
Run:
```bash
npm run install:all
```

### Fresh Start
```bash
# Stop all servers
Ctrl+C

# Clear node_modules (if needed)
# Then reinstall
npm run install:all

# Start fresh
npm run dev
```

---

## 💡 Tips

- Keep the terminal window open to see logs from all servers
- Each server auto-reloads on file changes (hot reload)
- Backend uses `nodemon` for auto-restart
- Frontend and Admin use Next.js fast refresh

---

Happy coding! 🎉

