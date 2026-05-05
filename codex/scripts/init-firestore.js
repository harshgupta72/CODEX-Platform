// Firebase Firestore Initialization Script
// Run this script to populate your Firestore database with sample data

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Firebase configuration - replace with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyDA8DbsqreEqI-eMPW3liK6Bu3DamGTSes",
  authDomain: "codecraft-academy-a3ee8.firebaseapp.com",
  projectId: "codecraft-academy-a3ee8",
  storageBucket: "codecraft-academy-a3ee8.firebasestorage.app",
  messagingSenderId: "827843726548",
  appId: "1:827843726548:web:3b88895ca6c2fc88633f41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeFirestore() {
  try {
    console.log('🚀 Initializing Firestore database...');

    // 1. Create sample users
    console.log('📝 Creating sample users...');
    const users = [
      {
        uid: 'sample-teacher-1',
        email: 'teacher@example.com',
        displayName: 'Dr. Smith',
        userType: 'teacher',
        userId: 'teacher-001',
        profile: {
          bio: 'Computer Science Professor',
          interests: ['Algorithms', 'Data Structures', 'Machine Learning'],
          experience: '10+ years'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uid: 'sample-student-1',
        email: 'student@example.com',
        displayName: 'John Doe',
        userType: 'student',
        userId: 'student-001',
        profile: {
          bio: 'Computer Science Student',
          interests: ['Programming', 'Web Development'],
          experience: '2 years'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of users) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Created user: ${user.displayName}`);
    }

    // 2. Create sample courses
    console.log('📚 Creating sample courses...');
    const courses = [
      {
        ownerUid: 'sample-teacher-1',
        title: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming with Python',
        category: 'Programming',
        difficulty: 'Beginner',
        status: 'published',
        startDate: '2024-01-15',
        endDate: '2024-06-15',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerUid: 'sample-teacher-1',
        title: 'Data Structures and Algorithms',
        description: 'Advanced course on data structures and algorithm design',
        category: 'Computer Science',
        difficulty: 'Intermediate',
        status: 'published',
        startDate: '2024-02-01',
        endDate: '2024-07-01',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const course of courses) {
      const docRef = await addDoc(collection(db, 'courses'), course);
      console.log(`✅ Created course: ${course.title} (ID: ${docRef.id})`);
    }

    // 3. Create sample problems
    console.log('🧩 Creating sample problems...');
    const problems = [
      {
        ownerUid: 'sample-teacher-1',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        category: 'Arrays',
        testCases: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            expectedOutput: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ],
        constraints: '2 <= nums.length <= 10^4',
        timeLimit: 30,
        memoryLimit: 64,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerUid: 'sample-teacher-1',
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.',
        difficulty: 'Easy',
        category: 'Strings',
        testCases: [
          {
            input: '["h","e","l","l","o"]',
            expectedOutput: '["o","l","l","e","h"]',
            explanation: 'The string is reversed in-place.'
          }
        ],
        constraints: '1 <= s.length <= 10^5',
        timeLimit: 30,
        memoryLimit: 64,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const problem of problems) {
      const docRef = await addDoc(collection(db, 'problems'), problem);
      console.log(`✅ Created problem: ${problem.title} (ID: ${docRef.id})`);
    }

    // 4. Create sample assignments
    console.log('📋 Creating sample assignments...');
    const assignments = [
      {
        ownerUid: 'sample-teacher-1',
        title: 'Week 1: Basic Programming',
        description: 'Complete the following programming problems',
        courseId: 'course-id-1', // You'll need to replace with actual course ID
        dueDate: '2024-02-15',
        maxPoints: 100,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const assignment of assignments) {
      const docRef = await addDoc(collection(db, 'assignments'), assignment);
      console.log(`✅ Created assignment: ${assignment.title} (ID: ${docRef.id})`);
    }

    // 5. Create sample notices
    console.log('📢 Creating sample notices...');
    const notices = [
      {
        title: 'Welcome to CODEX Platform',
        content: 'Welcome to our coding education platform! Start by exploring the courses and problems available.',
        targetAudience: 'all',
        priority: 'normal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'New Programming Problems Added',
        content: 'We have added 10 new programming problems to the platform. Check them out!',
        targetAudience: 'students',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const notice of notices) {
      const docRef = await addDoc(collection(db, 'notices'), notice);
      console.log(`✅ Created notice: ${notice.title} (ID: ${docRef.id})`);
    }

    console.log('🎉 Firestore database initialization completed successfully!');
    console.log('📊 Created:');
    console.log('   - 2 sample users (1 teacher, 1 student)');
    console.log('   - 2 sample courses');
    console.log('   - 2 sample problems');
    console.log('   - 1 sample assignment');
    console.log('   - 2 sample notices');

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
}

// Run the initialization
initializeFirestore();
