# CODEX Platform - Low Level Design

## Detailed Component Architecture

### 1. Frontend Component Hierarchy

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/page.tsx        # Login interface
│   │   └── register/             # Registration flows
│   ├── dashboard/                # Dashboard routes
│   │   ├── student/              # Student-specific pages
│   │   └── instructor/            # Instructor-specific pages
│   ├── editor/page.tsx         # Code editor interface
│   ├── problems/                 # Problem browsing
│   └── api/                      # API endpoints
├── components/                   # Reusable UI components
│   ├── ai-companion.tsx          # AI chatbot interface
│   ├── auth-gate.tsx            # Route protection
│   ├── navbar.tsx                # Navigation component
│   └── student-layout.tsx       # Student page wrapper
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # Authentication state
└── lib/                          # Utility libraries
    ├── firebase.ts              # Firebase configuration
    ├── ai-service.ts            # AI processing logic
    └── user.ts                  # User data management
```

### 2. Detailed Component Specifications

#### Authentication System

**File**: `src/hooks/useAuth.ts`
```typescript
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole; // "student" | "teacher" | "admin"
}

function useAuth() {
  // Firebase auth state management
  // Role-based user data fetching
  // Session persistence
}
```

**File**: `src/components/auth-gate.tsx`
```typescript
interface AuthGateProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

function RequireAuth({ children, requiredRole, fallback }) {
  // Route protection logic
  // Role-based access control
  // Loading states
}
```

#### AI Companion System

**File**: `src/components/ai-companion.tsx`
```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isRecommendation?: boolean;
  recommendationType?: string;
}

function AICompanion() {
  // Floating chat interface
  // Message history management
  // Real-time AI responses
  // Recommendation display
}
```

**File**: `src/lib/student-ai-service.ts`
```typescript
class StudentAIService {
  // OpenAI API integration
  // Context-aware responses
  // Recommendation generation
  // Fallback processing
  // User profile analysis
}
```

#### Code Execution System

**File**: `src/app/api/judge0/route.ts`
```typescript
interface CodeExecutionRequest {
  code: string;
  language: string; // "cpp" | "python" | "java" | "c"
}

interface CodeExecutionResponse {
  status: string;
  output: string;
  error?: string;
}

// Language mapping to Judge0 IDs
const LANGUAGE_MAP = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
};
```

**File**: `src/app/editor/page.tsx`
```typescript
function EditorPage() {
  // Monaco Editor integration
  // Language selection
  // Code execution
  // Output display
  // Syntax highlighting
}
```

### 3. Database Schema Design

#### Firestore Collections Structure

```typescript
// Users Collection
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "student" | "teacher" | "admin";
  
  // Student-specific fields
  studentId?: string;
  institution?: string;
  degree?: string;
  major?: string;
  graduationYear?: string;
  
  // Teacher-specific fields
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  company?: string;
  
  // Common fields
  programmingLanguages?: string[];
  frameworks?: string[];
  interests?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Courses Collection
interface CourseDocument {
  id: string;
  ownerUid: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "draft" | "published" | "archived";
  startDate: string;
  endDate: string;
  enrolledStudents: string[]; // Array of student UIDs
  assignments: string[]; // Array of assignment IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Problems Collection
interface ProblemDocument {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  languages: string[]; // Supported languages
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Submissions Collection
interface SubmissionDocument {
  id: string;
  studentUid: string;
  problemId: string;
  courseId?: string;
  assignmentId?: string;
  code: string;
  language: string;
  status: "pending" | "running" | "accepted" | "wrong_answer" | "time_limit" | "runtime_error";
  testResults: {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    executionTime: number;
    memoryUsed: number;
  }[];
  score: number;
  submittedAt: Timestamp;
  gradedAt?: Timestamp;
}

// Analytics Collection
interface AnalyticsDocument {
  userId: string;
  type: "student" | "teacher";
  
  // Student analytics
  problemsSolved?: number;
  totalScore?: number;
  averageScore?: number;
  streak?: number;
  studyTime?: number; // in minutes
  weakAreas?: string[];
  strongAreas?: string[];
  learningStyle?: string;
  
  // AI interaction analytics
  aiInteractions?: {
    timestamp: Timestamp;
    message: string;
    response: string;
    category: string;
  }[];
  
  // Performance metrics
  lastActivity: Timestamp;
  totalSessions: number;
  averageSessionTime: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. API Endpoints Design

#### Authentication Endpoints
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: AppUser;
  error?: string;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  profileData: Partial<UserProfileData>;
}
```

#### AI Service Endpoints
```typescript
// POST /api/ai/chat
interface ChatRequest {
  message: string;
  userId: string;
  conversationHistory: Message[];
}

interface ChatResponse {
  success: boolean;
  response: string;
  recommendations?: Recommendation[];
  updateRecommendations: boolean;
}

// POST /api/ai/recommendations
interface RecommendationsRequest {
  userId: string;
  category?: string;
}

interface RecommendationsResponse {
  success: boolean;
  recommendations: Recommendation[];
  timestamp: string;
}
```

#### Code Execution Endpoints
```typescript
// POST /api/judge0
interface CodeExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
}

interface CodeExecutionResponse {
  status: string;
  output: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}
```

### 5. Data Flow Diagrams

#### Student Learning Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Student   │───►│  Dashboard  │───►│   Problem   │───►│ Code Editor │
│   Login     │    │   Page      │    │  Selection  │    │   (Monaco)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Progress   │◄───│  Analytics  │◄───│   Results   │◄───│   Judge0    │
│  Update     │    │   Engine    │    │  Processing │    │   API       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### AI Companion Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───►│   AI Chat   │───►│  Context    │───►│   OpenAI    │
│  Message    │    │  Component  │    │  Analysis   │    │    API      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UI        │◄───│  Response   │◄───│  AI Service │◄───│  Response   │
│  Update     │    │ Processing  │    │   Layer     │    │ Generation  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Instructor Management Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Instructor  │───►│  Dashboard  │───►│   Course    │───►│ Assignment  │
│   Login     │    │   Page      │    │ Management  │    │  Creation   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Analytics  │◄───│  Student    │◄───│  Progress   │◄───│  Student    │
│  Dashboard  │    │ Monitoring  │    │ Tracking   │    │ Submissions │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 6. Component Interaction Patterns

#### Authentication Flow
```typescript
// 1. User attempts to access protected route
<RequireAuth>
  <RequireRole role="student">
    <StudentDashboard />
  </RequireRole>
</RequireAuth>

// 2. Auth hook checks Firebase auth state
const { user, isAuthenticated, loading } = useAuth();

// 3. Route protection middleware
if (!isAuthenticated) {
  redirect('/login');
}

// 4. Role-based access control
if (user?.role !== 'student') {
  redirect('/dashboard/instructor');
}
```

#### AI Companion Integration
```typescript
// 1. Student layout wraps all student pages
<StudentLayout>
  <StudentPage />
  <AICompanion /> {/* Always available */}
</StudentLayout>

// 2. AI companion manages its own state
const [messages, setMessages] = useState<Message[]>([]);
const [isOpen, setIsOpen] = useState(false);

// 3. Real-time chat processing
const sendMessage = async (message: string) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, userId, conversationHistory })
  });
  
  const data = await response.json();
  setMessages(prev => [...prev, data.response]);
};
```

#### Code Execution Flow
```typescript
// 1. User writes code in Monaco Editor
const [code, setCode] = useState('');

// 2. User clicks run button
const runCode = async () => {
  const response = await fetch('/api/judge0', {
    method: 'POST',
    body: JSON.stringify({ code, language })
  });
  
  const result = await response.json();
  setOutput(result.output);
};

// 3. Results displayed in output panel
<div className="output-panel">
  <pre>{output}</pre>
</div>
```

### 7. Error Handling Patterns

#### API Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  toast.error('Operation failed. Please try again.');
  return null;
}
```

#### Firebase Error Handling
```typescript
try {
  const { auth, db } = getFirebase();
  const user = await signInWithEmailAndPassword(auth, email, password);
  // Success handling
} catch (error: any) {
  if (error.code === 'auth/user-not-found') {
    toast.error('No account found with this email.');
  } else if (error.code === 'auth/wrong-password') {
    toast.error('Incorrect password.');
  } else {
    toast.error('Sign-in failed. Please try again.');
  }
}
```

### 8. Performance Optimization Strategies

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const AICompanion = dynamic(() => import('./ai-companion'), {
  loading: () => <div>Loading AI companion...</div>
});

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false // Client-side only
});
```

#### Caching Strategy
```typescript
// API response caching
const cache = new Map();

const fetchWithCache = async (url: string) => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
};
```

#### Real-time Updates
```typescript
// Firestore listeners for real-time data
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'users', userId),
    (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    }
  );
  
  return () => unsubscribe();
}, [userId]);
```

This low-level design provides detailed specifications for implementing each component of the CODEX platform, ensuring maintainable, scalable, and efficient code architecture.















