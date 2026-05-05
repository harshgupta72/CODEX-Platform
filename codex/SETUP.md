# CODEX Platform Setup Guide

## Quick Start

Follow these steps to get the CODEX platform running locally:

### 1. Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm
- A Firebase project
- (Optional) Judge0 API access

### 2. Installation

```bash
# Clone and navigate to the project
cd codex

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (start with test mode for development)
5. Get your config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the config values

### 4. Environment Configuration

Edit `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Judge0 configuration
JUDGE0_API_URL=https://ce.judge0.com
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Available

✅ **Authentication System**
- Google OAuth login/logout
- Role-based access (student/instructor)
- Protected routes

✅ **Code Editor**
- Multi-language support (C++, Python, Java, C)
- Real-time code execution
- Monaco Editor integration

✅ **Student Features**
- Browse and solve coding problems
- Track progress with analytics
- View leaderboard rankings
- Enroll in courses
- Complete assignments

✅ **Instructor Features**
- Create and manage courses
- Design assignments
- View student analytics
- Monitor progress
- Automated grading

✅ **Platform Features**
- Responsive design
- Dark/light theme toggle
- Real-time updates
- Interactive dashboards

## Troubleshooting

### Common Issues

1. **Firebase not configured error**
   - Make sure all Firebase environment variables are set
   - Check that your Firebase project has Authentication and Firestore enabled

2. **Code execution not working**
   - Verify Judge0 API URL is correct
   - Check if you need an API key for your Judge0 endpoint

3. **Build errors**
   - Make sure all dependencies are installed: `npm install`
   - Clear Next.js cache: `rm -rf .next`

### Development Tips

- Use the browser's developer tools to check for console errors
- Check the Network tab for failed API requests
- Verify Firebase rules allow read/write access during development

## Next Steps

1. Set up your Firebase security rules for production
2. Configure Judge0 API with proper rate limiting
3. Add more coding problems to the database
4. Customize the UI to match your branding
5. Deploy to Vercel or your preferred hosting platform

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your environment configuration
3. Ensure Firebase services are properly enabled
4. Create an issue in the repository for bugs

