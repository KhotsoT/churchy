# Church Manager - Comprehensive Church Management System

A full-featured, cross-platform church management application built with React, Vite, and Capacitor for native mobile support, plus Node.js/Express backend. This system provides everything a church needs to manage members, events, donations, groups, and more.

## Features

### Core Modules

1. **Member Management**
   - Complete member profiles with custom fields
   - Family relationships and grouping
   - Membership status tracking
   - Search and filtering capabilities

2. **Attendance Tracking**
   - Service attendance recording
   - Event attendance tracking
   - Check-in/check-out functionality
   - Attendance reports

3. **Event Management**
   - Create and manage events
   - Calendar integration
   - Event registration
   - Recurring events support

4. **Donations & Financials**
   - Record donations
   - Multiple payment methods
   - Donation tracking and reporting
   - Receipt generation

5. **Groups & Ministries**
   - Small groups management
   - Ministry organization
   - Member assignments
   - Group communication

6. **Communication**
   - In-app messaging
   - Announcements
   - Email and SMS integration
   - Push notifications

7. **Prayer Requests**
   - Submit and manage prayer requests
   - Public/private requests
   - Prayer tracking

8. **Volunteer Management**
   - Volunteer roles and assignments
   - Schedule management
   - Service tracking

9. **Service Planning**
   - Service order planning
   - Role assignments
   - Resource management

10. **Reports & Analytics**
    - Custom report generation
    - Attendance analytics
    - Financial reports
    - Membership reports

11. **Settings & Customization**
    - Church profile management
    - Custom fields configuration
    - Feature toggles
    - User roles and permissions

## Technology Stack

### Frontend
- **React** with Vite
- **TypeScript** for type safety
- **React Router** for navigation
- **Capacitor** for native mobile support
- **Zustand** for state management
- **React Hook Form** with Yup for forms
- **Axios** for API calls
- **Custom UI Components** built with CSS

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- MongoDB (local or cloud instance)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd church-manager
   ```

2. **Install frontend dependencies**
   ```bash
   yarn install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   yarn install
   ```

4. **Set up environment variables**
   
   Create `server/.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/church-manager
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd server
   yarn dev
   ```

7. **Start the frontend**
   ```bash
   # From root directory
   yarn dev
   ```

   Or run both concurrently:
   ```bash
   yarn dev:full
   ```

8. **For mobile development:**
   ```bash
   # Build and sync with Capacitor
   yarn build
   yarn sync
   
   # Open in Android Studio
   yarn android
   
   # Open in Xcode (macOS only)
   yarn ios
   ```

## Project Structure

```
church-manager/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── theme.ts          # Theme configuration
├── server/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── index.js          # Server entry point
├── App.tsx               # Main app component
├── package.json
└── README.md
```

## Usage

### Creating an Account

1. Launch the app
2. Tap "Sign Up"
3. Enter church name, your details, and create a password
4. You'll be automatically logged in as an admin

### Managing Members

1. Navigate to the Members tab
2. Tap the + button to add a new member
3. Fill in member details
4. Use search and filters to find members

### Recording Attendance

1. Go to Attendance screen
2. Select an event
3. Mark members as present/absent/late
4. View attendance reports

### Creating Events

1. Navigate to Events tab
2. Tap + to create new event
3. Fill in event details
4. Set recurring patterns if needed

## Customization

The system is highly customizable:

- **Custom Fields**: Add custom fields to members, events, groups, and donations
- **Feature Flags**: Enable/disable features per church
- **Themes**: Customize colors and styling
- **User Roles**: Configure role-based permissions

## Development

### Running Tests
```bash
# Frontend tests (when implemented)
yarn test

# Backend tests (when implemented)
cd server && yarn test
```

### Building for Production

```bash
# Build web version
yarn build

# Sync with Capacitor
yarn sync

# Build Android APK
cd android && ./gradlew assembleRelease

# Build iOS (requires Xcode on macOS)
# Open ios/App/App.xcworkspace in Xcode and build
```

## API Documentation

The API follows RESTful conventions:

- `POST /api/auth/register` - Register new church and admin
- `POST /api/auth/login` - User login
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Record donation

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@churchmanager.com or open an issue in the repository.

## Roadmap

- [ ] Advanced reporting with charts
- [ ] Email integration
- [ ] SMS notifications
- [ ] Online giving integration
- [ ] Child check-in system
- [ ] Resource booking
- [ ] Document management
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Data export/import

