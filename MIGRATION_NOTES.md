# Migration from Expo to Capacitor

This project has been migrated from Expo to Capacitor + Vite to provide better control and compatibility.

## What Changed

### Frontend Stack
- ✅ Removed Expo and all Expo dependencies
- ✅ Added Vite as the build tool
- ✅ Added Capacitor for native mobile support
- ✅ Replaced React Navigation with React Router
- ✅ Replaced React Native Paper with custom web components
- ✅ Replaced Expo SecureStore with Capacitor Preferences
- ✅ Converted all React Native components to React web components

### Configuration Files
- ✅ `vite.config.ts` - Vite configuration (similar to gennessence-app)
- ✅ `capacitor.config.json` - Capacitor configuration
- ✅ `tsconfig.json` & `tsconfig.app.json` - TypeScript configs
- ✅ `eslint.config.js` - ESLint configuration
- ✅ `index.html` - HTML entry point
- ✅ Removed `babel.config.js` and `app.json`

### Project Structure
- ✅ All screens converted to web React components
- ✅ Custom UI components in `src/components/ui/`
- ✅ CSS modules for styling
- ✅ React Router for navigation
- ✅ MainLayout component for sidebar navigation

## Key Differences

### Storage
- **Before**: `expo-secure-store`
- **After**: `@capacitor/preferences`

### Navigation
- **Before**: React Navigation (`@react-navigation/native`)
- **After**: React Router (`react-router-dom`)

### UI Components
- **Before**: React Native Paper
- **After**: Custom web components with CSS

### Build System
- **Before**: Expo CLI
- **After**: Vite + Capacitor CLI

## Running the App

### Development
```bash
# Frontend only
yarn dev

# Backend only
yarn server

# Both together
yarn dev:full
```

### Mobile Development
```bash
# Build web assets
yarn build

# Sync with Capacitor
yarn sync

# Open in Android Studio
yarn android

# Open in Xcode (macOS)
yarn ios
```

## Benefits of Capacitor

1. **More Control**: Direct access to native projects
2. **Better Performance**: No Expo runtime overhead
3. **Flexibility**: Can modify native code directly
4. **Web First**: Works great as a web app, then wraps for mobile
5. **Standard Tooling**: Uses standard web build tools (Vite)

## Next Steps

1. Install dependencies: `yarn install`
2. Set up backend: See `server/` directory
3. Configure Capacitor: See `capacitor.config.json`
4. Build for mobile: `yarn build && yarn sync`

