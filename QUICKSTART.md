# Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Yarn** - Install via `npm install -g yarn`
3. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)

## Installation Steps

### 1. Install Dependencies

```bash
# Install frontend dependencies
yarn install

# Install backend dependencies
cd server
yarn install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod` (or use your system's service manager)

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get your connection string

### 3. Configure Environment Variables

Create `server/.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/church-manager
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/church-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Start the Application

**Option A: Run Both Frontend and Backend Together**
```bash
yarn dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
cd server
yarn dev
```

Terminal 2 (Frontend):
```bash
yarn start
```

### 5. Access the Application

- **Mobile**: Use Expo Go app to scan the QR code
- **Web**: Press `w` in the terminal or visit the URL shown
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal

## First Time Setup

1. Open the app
2. Tap "Sign Up"
3. Enter:
   - Church Name
   - Your First Name
   - Your Last Name
   - Email
   - Password (min 6 characters)
4. You'll be automatically logged in as an admin

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `server/.env`
- Check firewall settings if using cloud MongoDB

### Port Already in Use
- Change `PORT` in `server/.env` to a different port (e.g., 3001)
- Update `API_BASE_URL` in `src/utils/constants.ts` to match

### Expo Issues
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && yarn install`

### TypeScript Errors
- Run type check: `yarn type-check`
- Ensure all dependencies are installed

## Next Steps

- Explore the Dashboard
- Add your first member
- Create an event
- Record a donation
- Customize settings

For more details, see the [README.md](README.md)

