// Environment Setup Script
// This script helps you set up your .env.local file with Firebase configuration

const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Environment Setup');
console.log('===============================\n');

console.log('To fix the "client is offline" error, you need to set up your Firebase environment variables.\n');

console.log('📋 Steps to get your Firebase configuration:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project: codex-83bd0');
console.log('3. Go to Project Settings (gear icon) → General tab');
console.log('4. Scroll down to "Your apps" section');
console.log('5. Find your web app "codex-web"');
console.log('6. Click "Config" radio button');
console.log('7. Copy the configuration values\n');

console.log('📝 Create a .env.local file in your project root with these values:');
console.log('(Replace the placeholder values with your actual Firebase config)\n');

const envTemplate = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codex-83bd0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=codex-83bd0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codex-83bd0.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Judge0 API Configuration (optional)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_key_here`;

console.log(envTemplate);

console.log('\n🚀 After creating .env.local:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Try signing up again');
console.log('3. The "client is offline" error should be resolved\n');

console.log('💡 If you still get errors:');
console.log('- Check that all environment variables are set correctly');
console.log('- Make sure your Firebase project has Firestore enabled');
console.log('- Verify your internet connection');
console.log('- Check browser console for specific error messages\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  console.log('Make sure it contains the correct Firebase configuration values\n');
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create it with the template above\n');
}

console.log('🔍 Common issues and solutions:');
console.log('- "Client is offline": Usually means Firebase config is missing or incorrect');
console.log('- "No record found": Database is empty, need to create collections');
console.log('- "Permission denied": Firestore security rules need to be configured');
console.log('- "Network error": Check internet connection and Firebase project status\n');
