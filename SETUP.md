# Setup Instructions

## Complete Setup Checklist

### ✅ Step 1: Install Dependencies

```bash
# Frontend
yarn install

# Backend
cd server
yarn install
cd ..
```

### ✅ Step 2: MongoDB Setup

**Choose one option:**

**Option A: Local MongoDB**
```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Start MongoDB (varies by OS):
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Use connection string in `.env` file

### ✅ Step 3: Environment Configuration

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/church-manager
# OR for Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/church-manager
JWT_SECRET=change-this-to-a-random-secret-key-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### ✅ Step 4: Start Development Servers

**Option A: Run Both Together**
```bash
yarn dev
```

**Option B: Run Separately**

Terminal 1:
```bash
cd server
yarn dev
```

Terminal 2:
```bash
yarn start
```

### ✅ Step 5: Access the App

- **Web**: Press `w` in Expo terminal or visit shown URL
- **iOS**: Press `i` (requires Xcode) or scan QR with Expo Go app
- **Android**: Press `a` (requires emulator) or scan QR with Expo Go app

### ✅ Step 6: First Login

1. Open the app
2. Tap "Sign Up"
3. Create your church account
4. You'll be logged in as admin automatically

## Mobile Device Setup

If testing on a physical device:

1. **Find your computer's IP address:**
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

2. **Update API URL:**
   Edit `src/utils/constants.ts`:
   ```typescript
   export const API_BASE_URL = __DEV__
     ? 'http://YOUR_IP_ADDRESS:3000/api'  // Replace YOUR_IP_ADDRESS
     : 'https://api.churchmanager.com/api';
   ```

3. **Ensure device and computer are on same network**

4. **Start backend server:**
   ```bash
   cd server
   yarn dev
   ```

5. **Start frontend:**
   ```bash
   yarn start
   ```

## Troubleshooting

### MongoDB Connection Failed
- ✅ Check MongoDB is running: `mongod` or service status
- ✅ Verify connection string in `server/.env`
- ✅ Check firewall/network settings
- ✅ For Atlas: Whitelist your IP address

### Port 3000 Already in Use
- ✅ Change port in `server/.env`: `PORT=3001`
- ✅ Update `src/utils/constants.ts` API_BASE_URL

### Expo Issues
- ✅ Clear cache: `expo start -c`
- ✅ Reinstall: `rm -rf node_modules && yarn install`
- ✅ Check Node version: `node --version` (should be 18+)

### TypeScript Errors
- ✅ Run: `yarn type-check`
- ✅ Ensure all dependencies installed
- ✅ Check `tsconfig.json` paths

### API Connection Issues (Mobile)
- ✅ Verify IP address in constants.ts
- ✅ Check backend is running
- ✅ Ensure same WiFi network
- ✅ Check firewall settings

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Use production MongoDB (Atlas recommended)
4. Deploy to Heroku, AWS, DigitalOcean, etc.

### Frontend
1. Build: `expo build:ios` or `expo build:android`
2. Or use EAS Build: `eas build`
3. Update `API_BASE_URL` to production URL

## Next Steps

- ✅ Read [README.md](README.md) for full documentation
- ✅ Check [FEATURES.md](FEATURES.md) for feature list
- ✅ Review [QUICKSTART.md](QUICKSTART.md) for quick reference

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review error messages carefully
3. Check MongoDB and server logs
4. Verify all environment variables are set

---

**You're all set! Start building your church management system! 🎉**

