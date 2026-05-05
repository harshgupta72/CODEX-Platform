# CODEX Platform

A robust platform for automated code evaluation and assessment built with Next.js, Firebase, and Judge0.

## Features

### 🎓 For Students
- **Code Editor**: Write and execute code in multiple languages (C++, Python, Java, C)
- **Problem Solving**: Practice with curated coding problems of varying difficulty
- **Progress Tracking**: Monitor your coding journey with detailed analytics
- **Leaderboard**: Compete with peers and track your ranking
- **Course Enrollment**: Join courses and complete assignments
- **Real-time Feedback**: Get instant feedback on your code submissions

### 👨‍🏫 For Instructors
- **Course Management**: Create and manage courses with full CRUD operations
- **Assignment Creation**: Design coding assignments with custom problems
- **Student Analytics**: Track student performance with comprehensive dashboards
- **Automated Grading**: Leverage Judge0 for automatic code evaluation
- **Progress Monitoring**: View detailed student progress and engagement metrics

### 🚀 Platform Features
- **Multi-language Support**: C++, Python, Java, and C
- **Real-time Code Execution**: Powered by Judge0 API
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Toggle between themes for comfortable coding
- **Authentication**: Secure Google OAuth integration via Firebase
- **Role-based Access**: Different interfaces for students and instructors

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firestore
- **Code Execution**: Judge0 API
- **Code Editor**: Monaco Editor (VS Code editor)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Firebase project
- Judge0 API access (optional, free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codex
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Optional: Judge0 configuration
   JUDGE0_API_URL=https://ce.judge0.com
   JUDGE0_API_KEY=your_rapidapi_key_if_using_rapidapi
   ```

4. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Add your domain to authorized domains in Authentication settings

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
codex/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── editor/            # Code editor
│   │   ├── problems/          # Problem pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── public/                    # Static assets
└── ...config files
```

## Key Components

### Authentication System
- Firebase Auth integration with Google OAuth
- Role-based access control (student/instructor/admin)
- Protected routes with auth guards

### Code Execution Engine
- Judge0 API integration for multi-language support
- Real-time code execution with output display
- Support for custom test cases and time limits

### Dashboard System
- Separate interfaces for students and instructors
- Real-time analytics and progress tracking
- Interactive charts and data visualization

## Usage

### For Students
1. Sign in with Google account
2. Browse available problems or courses
3. Use the code editor to solve problems
4. Track your progress in the dashboard
5. Compete on the leaderboard

### For Instructors
1. Sign in and access instructor dashboard
2. Create courses and assignments
3. Monitor student progress
4. View analytics and performance metrics
5. Manage course content and settings

## API Endpoints

- `POST /api/judge0` - Execute code using Judge0 API

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for authentication and database
- [Judge0](https://judge0.com/) for code execution API
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Tailwind CSS](https://tailwindcss.com/) for styling
# codex-Testing
