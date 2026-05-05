// Populate Firestore with Dummy Data
// Run this script to add sample courses, assignments, problems, and notices

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } = require('firebase/firestore');

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

async function populateDummyData() {
  try {
    console.log('🚀 Populating Firestore with dummy data...');

    // Sample teacher UID (you can change this to your actual teacher UID)
    const teacherUid = 'sample-teacher-1';

    // 1. Create dummy courses
    console.log('📚 Creating dummy courses...');
    const courses = [
      {
        ownerUid: teacherUid,
        title: "Introduction to Programming",
        description: "Learn the fundamentals of programming with Python. Perfect for beginners who want to start their coding journey.",
        category: "Computer Science",
        difficulty: "Beginner",
        status: "published",
        startDate: "2024-01-15",
        endDate: "2024-06-15",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Data Structures and Algorithms",
        description: "Master fundamental data structures like arrays, linked lists, stacks, queues, and trees. Learn sorting and searching algorithms.",
        category: "Computer Science",
        difficulty: "Intermediate",
        status: "published",
        startDate: "2024-02-01",
        endDate: "2024-07-01",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Web Development Fundamentals",
        description: "Build modern web applications using HTML, CSS, JavaScript, and React. Learn responsive design and web APIs.",
        category: "Web Development",
        difficulty: "Beginner",
        status: "published",
        startDate: "2024-01-20",
        endDate: "2024-06-20",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Advanced Machine Learning",
        description: "Deep dive into machine learning algorithms, neural networks, and deep learning frameworks like TensorFlow and PyTorch.",
        category: "AI/ML",
        difficulty: "Advanced",
        status: "published",
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Database Design and Management",
        description: "Learn SQL, database design principles, normalization, and working with both SQL and NoSQL databases.",
        category: "Database",
        difficulty: "Intermediate",
        status: "published",
        startDate: "2024-02-15",
        endDate: "2024-07-15",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Mobile App Development",
        description: "Create mobile applications for iOS and Android using React Native and Flutter. Learn app deployment and store submission.",
        category: "Mobile Development",
        difficulty: "Intermediate",
        status: "published",
        startDate: "2024-03-15",
        endDate: "2024-08-15",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Cybersecurity Fundamentals",
        description: "Learn about network security, cryptography, ethical hacking, and security best practices for software development.",
        category: "Cybersecurity",
        difficulty: "Intermediate",
        status: "published",
        startDate: "2024-04-01",
        endDate: "2024-09-01",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Cloud Computing with AWS",
        description: "Master Amazon Web Services, cloud architecture, serverless computing, and DevOps practices.",
        category: "Cloud Computing",
        difficulty: "Advanced",
        status: "published",
        startDate: "2024-04-15",
        endDate: "2024-09-15",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Game Development with Unity",
        description: "Create 2D and 3D games using Unity game engine. Learn game physics, scripting, and publishing.",
        category: "Game Development",
        difficulty: "Intermediate",
        status: "published",
        startDate: "2024-05-01",
        endDate: "2024-10-01",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Blockchain and Cryptocurrency",
        description: "Understand blockchain technology, smart contracts, DeFi, and cryptocurrency development.",
        category: "Blockchain",
        difficulty: "Advanced",
        status: "draft",
        startDate: "2024-06-01",
        endDate: "2024-11-01",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const course of courses) {
      await addDoc(collection(db, 'courses'), course);
      console.log(`✅ Created course: ${course.title}`);
    }

    // 2. Create dummy assignments
    console.log('📝 Creating dummy assignments...');
    const assignments = [
      {
        ownerUid: teacherUid,
        title: "Python Basics Assignment",
        description: "Complete 5 Python programming exercises covering variables, loops, and functions.",
        dueDate: "2024-02-15",
        totalPoints: 100,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Data Structures Implementation",
        description: "Implement and test various data structures including arrays, linked lists, and stacks.",
        dueDate: "2024-03-01",
        totalPoints: 150,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Web Development Project",
        description: "Build a responsive website using HTML, CSS, and JavaScript with modern design principles.",
        dueDate: "2024-03-15",
        totalPoints: 200,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Machine Learning Model",
        description: "Create and train a machine learning model to solve a real-world problem using Python.",
        dueDate: "2024-04-01",
        totalPoints: 250,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Database Design Project",
        description: "Design and implement a complete database system with proper normalization and relationships.",
        dueDate: "2024-04-15",
        totalPoints: 180,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Mobile App Development",
        description: "Develop a cross-platform mobile application using React Native or Flutter.",
        dueDate: "2024-05-01",
        totalPoints: 300,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Cybersecurity Lab",
        description: "Perform security analysis and penetration testing on a provided system.",
        dueDate: "2024-05-15",
        totalPoints: 220,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Cloud Architecture Design",
        description: "Design and deploy a scalable cloud application using AWS services.",
        dueDate: "2024-06-01",
        totalPoints: 280,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Game Development Project",
        description: "Create a complete 2D or 3D game using Unity with proper game mechanics and UI.",
        dueDate: "2024-06-15",
        totalPoints: 350,
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Blockchain Smart Contract",
        description: "Develop and deploy a smart contract on Ethereum blockchain with proper testing.",
        dueDate: "2024-07-01",
        totalPoints: 400,
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const assignment of assignments) {
      await addDoc(collection(db, 'assignments'), assignment);
      console.log(`✅ Created assignment: ${assignment.title}`);
    }

    // 3. Create dummy problems
    console.log('🧩 Creating dummy problems...');
    const problems = [
      {
        ownerUid: teacherUid,
        name: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        sampleInput: "nums = [2,7,11,15], target = 9",
        sampleOutput: "[0,1]",
        testCases: [
          { input: "[2,7,11,15], 9", output: "[0,1]" },
          { input: "[3,2,4], 6", output: "[1,2]" },
          { input: "[3,3], 6", output: "[0,1]" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters.",
        sampleInput: "['h','e','l','l','o']",
        sampleOutput: "['o','l','l','e','h']",
        testCases: [
          { input: "['h','e','l','l','o']", output: "['o','l','l','e','h']" },
          { input: "['H','a','n','n','a','h']", output: "['h','a','n','n','a','H']" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        sampleInput: "()",
        sampleOutput: "true",
        testCases: [
          { input: "()", output: "true" },
          { input: "()[]{}", output: "true" },
          { input: "(]", output: "false" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        sampleInput: "abcabcbb",
        sampleOutput: "3",
        testCases: [
          { input: "abcabcbb", output: "3" },
          { input: "bbbbb", output: "1" },
          { input: "pwwkew", output: "3" }
        ],
        difficulty: "Medium",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Binary Search",
        description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
        sampleInput: "nums = [-1,0,3,5,9,12], target = 9",
        sampleOutput: "4",
        testCases: [
          { input: "[-1,0,3,5,9,12], 9", output: "4" },
          { input: "[-1,0,3,5,9,12], 2", output: "-1" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Merge Two Sorted Lists",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        sampleInput: "l1 = [1,2,4], l2 = [1,3,4]",
        sampleOutput: "[1,1,2,3,4,4]",
        testCases: [
          { input: "[1,2,4], [1,3,4]", output: "[1,1,2,3,4,4]" },
          { input: "[], []", output: "[]" },
          { input: "[], [0]", output: "[0]" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        sampleInput: "[-2,1,-3,4,-1,2,1,-5,4]",
        sampleOutput: "6",
        testCases: [
          { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
          { input: "[1]", output: "1" },
          { input: "[5,4,-1,7,8]", output: "23" }
        ],
        difficulty: "Medium",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        sampleInput: "2",
        sampleOutput: "2",
        testCases: [
          { input: "2", output: "2" },
          { input: "3", output: "3" },
          { input: "5", output: "8" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Best Time to Buy and Sell Stock",
        description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        sampleInput: "[7,1,5,3,6,4]",
        sampleOutput: "5",
        testCases: [
          { input: "[7,1,5,3,6,4]", output: "5" },
          { input: "[7,6,4,3,1]", output: "0" }
        ],
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        name: "Longest Palindromic Substring",
        description: "Given a string s, return the longest palindromic substring in s.",
        sampleInput: "babad",
        sampleOutput: "bab",
        testCases: [
          { input: "babad", output: "bab" },
          { input: "cbbd", output: "bb" },
          { input: "a", output: "a" }
        ],
        difficulty: "Medium",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const problem of problems) {
      await addDoc(collection(db, 'problems'), problem);
      console.log(`✅ Created problem: ${problem.name}`);
    }

    // 4. Create dummy notices
    console.log('📢 Creating dummy notices...');
    const notices = [
      {
        ownerUid: teacherUid,
        title: "Welcome to CODEX Platform!",
        body: "Welcome to our comprehensive coding education platform! We're excited to have you join our learning community. Over the next weeks, we'll be covering various programming concepts and solving algorithmic challenges together. Please don't hesitate to reach out if you have any questions.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "New Programming Problems Added",
        body: "We have added 15 new programming problems to the platform covering data structures, algorithms, and problem-solving techniques. These problems range from beginner to advanced levels. Start solving them to improve your coding skills!",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Assignment Deadline Reminder",
        body: "This is a friendly reminder that the Python Basics Assignment is due on February 15th. Please ensure you submit your work on time. Late submissions will be penalized. Good luck with your coding!",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Class Schedule Update",
        body: "Please note that our class schedule has been updated for the upcoming week. The new schedule will be posted on the course page. Please plan accordingly and check for any changes.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Midterm Exam Announcement",
        body: "I would like to inform you that the Midterm Exam will be conducted on March 15th from 10:00 AM to 12:00 PM. Please prepare thoroughly and bring your required materials. The exam will cover all topics discussed in the first half of the course.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Office Hours Update",
        body: "My office hours have been updated to Tuesdays and Thursdays from 2:00 PM to 4:00 PM. Feel free to drop by if you need help with assignments or have any questions about the course material.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Project Submission Guidelines",
        body: "Please review the project submission guidelines carefully. All projects must be submitted through the platform by the due date. Include proper documentation and comments in your code. Plagiarism will not be tolerated.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Coding Competition Announcement",
        body: "We're organizing an internal coding competition next month! This is a great opportunity to test your skills and compete with your peers. More details will be shared soon. Start practicing!",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Course Materials Update",
        body: "New course materials have been uploaded including video lectures, reading assignments, and practice exercises. Please check the course page regularly for updates and new content.",
        audience: "all",
        createdAt: serverTimestamp()
      },
      {
        ownerUid: teacherUid,
        title: "Final Project Requirements",
        body: "The final project requirements have been posted. You can choose from a list of suggested projects or propose your own. All projects must be approved by the instructor. The deadline for project proposals is April 1st.",
        audience: "all",
        createdAt: serverTimestamp()
      }
    ];

    for (const notice of notices) {
      await addDoc(collection(db, 'notices'), notice);
      console.log(`✅ Created notice: ${notice.title}`);
    }

    console.log('🎉 Dummy data population completed successfully!');
    console.log('📊 Created:');
    console.log('   - 10 courses (9 published, 1 draft)');
    console.log('   - 10 assignments (9 published, 1 draft)');
    console.log('   - 10 coding problems (various difficulties)');
    console.log('   - 10 notices (announcements and updates)');

  } catch (error) {
    console.error('❌ Error populating dummy data:', error);
  }
}

// Run the population
populateDummyData();
