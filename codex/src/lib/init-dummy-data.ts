import { createCourse, createAssignment, createProblem, createNotice } from "./teacher";

export const dummyCourses = [
  {
    title: "Introduction to Programming",
    description: "Learn the fundamentals of programming with Python. Perfect for beginners who want to start their coding journey.",
    category: "Computer Science",
    difficulty: "Beginner" as const,
    status: "published" as const,
    startDate: "2024-01-15",
    endDate: "2024-06-15"
  },
  {
    title: "Data Structures and Algorithms",
    description: "Master fundamental data structures like arrays, linked lists, stacks, queues, and trees. Learn sorting and searching algorithms.",
    category: "Computer Science",
    difficulty: "Intermediate" as const,
    status: "published" as const,
    startDate: "2024-02-01",
    endDate: "2024-07-01"
  },
  {
    title: "Web Development Fundamentals",
    description: "Build modern web applications using HTML, CSS, JavaScript, and React. Learn responsive design and web APIs.",
    category: "Web Development",
    difficulty: "Beginner" as const,
    status: "published" as const,
    startDate: "2024-01-20",
    endDate: "2024-06-20"
  },
  {
    title: "Advanced Machine Learning",
    description: "Deep dive into machine learning algorithms, neural networks, and deep learning frameworks like TensorFlow and PyTorch.",
    category: "AI/ML",
    difficulty: "Advanced" as const,
    status: "published" as const,
    startDate: "2024-03-01",
    endDate: "2024-08-01"
  },
  {
    title: "Database Design and Management",
    description: "Learn SQL, database design principles, normalization, and working with both SQL and NoSQL databases.",
    category: "Database",
    difficulty: "Intermediate" as const,
    status: "published" as const,
    startDate: "2024-02-15",
    endDate: "2024-07-15"
  },
  {
    title: "Mobile App Development",
    description: "Create mobile applications for iOS and Android using React Native and Flutter. Learn app deployment and store submission.",
    category: "Mobile Development",
    difficulty: "Intermediate" as const,
    status: "published" as const,
    startDate: "2024-03-15",
    endDate: "2024-08-15"
  },
  {
    title: "Cybersecurity Fundamentals",
    description: "Learn about network security, cryptography, ethical hacking, and security best practices for software development.",
    category: "Cybersecurity",
    difficulty: "Intermediate" as const,
    status: "published" as const,
    startDate: "2024-04-01",
    endDate: "2024-09-01"
  },
  {
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services, cloud architecture, serverless computing, and DevOps practices.",
    category: "Cloud Computing",
    difficulty: "Advanced" as const,
    status: "published" as const,
    startDate: "2024-04-15",
    endDate: "2024-09-15"
  },
  {
    title: "Game Development with Unity",
    description: "Create 2D and 3D games using Unity game engine. Learn game physics, scripting, and publishing.",
    category: "Game Development",
    difficulty: "Intermediate" as const,
    status: "published" as const,
    startDate: "2024-05-01",
    endDate: "2024-10-01"
  },
  {
    title: "Blockchain and Cryptocurrency",
    description: "Understand blockchain technology, smart contracts, DeFi, and cryptocurrency development.",
    category: "Blockchain",
    difficulty: "Advanced" as const,
    status: "draft" as const,
    startDate: "2024-06-01",
    endDate: "2024-11-01"
  }
];

export const dummyAssignments = [
  {
    title: "Python Basics Assignment",
    description: "Complete 5 Python programming exercises covering variables, loops, and functions.",
    dueDate: "2024-02-15",
    totalPoints: 100,
    status: "published" as const
  },
  {
    title: "Data Structures Implementation",
    description: "Implement and test various data structures including arrays, linked lists, and stacks.",
    dueDate: "2024-03-01",
    totalPoints: 150,
    status: "published" as const
  },
  {
    title: "Web Development Project",
    description: "Build a responsive website using HTML, CSS, and JavaScript with modern design principles.",
    dueDate: "2024-03-15",
    totalPoints: 200,
    status: "published" as const
  },
  {
    title: "Machine Learning Model",
    description: "Create and train a machine learning model to solve a real-world problem using Python.",
    dueDate: "2024-04-01",
    totalPoints: 250,
    status: "published" as const
  },
  {
    title: "Database Design Project",
    description: "Design and implement a complete database system with proper normalization and relationships.",
    dueDate: "2024-04-15",
    totalPoints: 180,
    status: "published" as const
  },
  {
    title: "Mobile App Development",
    description: "Develop a cross-platform mobile application using React Native or Flutter.",
    dueDate: "2024-05-01",
    totalPoints: 300,
    status: "published" as const
  },
  {
    title: "Cybersecurity Lab",
    description: "Perform security analysis and penetration testing on a provided system.",
    dueDate: "2024-05-15",
    totalPoints: 220,
    status: "published" as const
  },
  {
    title: "Cloud Architecture Design",
    description: "Design and deploy a scalable cloud application using AWS services.",
    dueDate: "2024-06-01",
    totalPoints: 280,
    status: "published" as const
  },
  {
    title: "Game Development Project",
    description: "Create a complete 2D or 3D game using Unity with proper game mechanics and UI.",
    dueDate: "2024-06-15",
    totalPoints: 350,
    status: "published" as const
  },
  {
    title: "Blockchain Smart Contract",
    description: "Develop and deploy a smart contract on Ethereum blockchain with proper testing.",
    dueDate: "2024-07-01",
    totalPoints: 400,
    status: "draft" as const
  }
];

export const dummyProblems = [
  {
    name: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]" },
      { input: "[3,2,4], 6", output: "[1,2]" },
      { input: "[3,3], 6", output: "[0,1]" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    sampleInput: "['h','e','l','l','o']",
    sampleOutput: "['o','l','l','e','h']",
    testCases: [
      { input: "['h','e','l','l','o']", output: "['o','l','l','e','h']" },
      { input: "['H','a','n','n','a','h']", output: "['h','a','n','n','a','H']" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    sampleInput: "()",
    sampleOutput: "true",
    testCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    testCases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" }
    ],
    difficulty: "Medium" as const
  },
  {
    name: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
    sampleInput: "nums = [-1,0,3,5,9,12], target = 9",
    sampleOutput: "4",
    testCases: [
      { input: "[-1,0,3,5,9,12], 9", output: "4" },
      { input: "[-1,0,3,5,9,12], 2", output: "-1" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists and return it as a sorted list.",
    sampleInput: "l1 = [1,2,4], l2 = [1,3,4]",
    sampleOutput: "[1,1,2,3,4,4]",
    testCases: [
      { input: "[1,2,4], [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "[], []", output: "[]" },
      { input: "[], [0]", output: "[0]" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    sampleInput: "[-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" }
    ],
    difficulty: "Medium" as const
  },
  {
    name: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    sampleInput: "2",
    sampleOutput: "2",
    testCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "5", output: "8" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
    sampleInput: "[7,1,5,3,6,4]",
    sampleOutput: "5",
    testCases: [
      { input: "[7,1,5,3,6,4]", output: "5" },
      { input: "[7,6,4,3,1]", output: "0" }
    ],
    difficulty: "Easy" as const
  },
  {
    name: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    sampleInput: "babad",
    sampleOutput: "bab",
    testCases: [
      { input: "babad", output: "bab" },
      { input: "cbbd", output: "bb" },
      { input: "a", output: "a" }
    ],
    difficulty: "Medium" as const
  }
];

export const dummyNotices = [
  {
    title: "Welcome to CODEX Platform!",
    body: "Welcome to our comprehensive coding education platform! We're excited to have you join our learning community. Over the next weeks, we'll be covering various programming concepts and solving algorithmic challenges together. Please don't hesitate to reach out if you have any questions.",
    audience: "all" as const
  },
  {
    title: "New Programming Problems Added",
    body: "We have added 15 new programming problems to the platform covering data structures, algorithms, and problem-solving techniques. These problems range from beginner to advanced levels. Start solving them to improve your coding skills!",
    audience: "all" as const
  },
  {
    title: "Assignment Deadline Reminder",
    body: "This is a friendly reminder that the Python Basics Assignment is due on February 15th. Please ensure you submit your work on time. Late submissions will be penalized. Good luck with your coding!",
    audience: "all" as const
  },
  {
    title: "Class Schedule Update",
    body: "Please note that our class schedule has been updated for the upcoming week. The new schedule will be posted on the course page. Please plan accordingly and check for any changes.",
    audience: "all" as const
  },
  {
    title: "Midterm Exam Announcement",
    body: "I would like to inform you that the Midterm Exam will be conducted on March 15th from 10:00 AM to 12:00 PM. Please prepare thoroughly and bring your required materials. The exam will cover all topics discussed in the first half of the course.",
    audience: "all" as const
  },
  {
    title: "Office Hours Update",
    body: "My office hours have been updated to Tuesdays and Thursdays from 2:00 PM to 4:00 PM. Feel free to drop by if you need help with assignments or have any questions about the course material.",
    audience: "all" as const
  },
  {
    title: "Project Submission Guidelines",
    body: "Please review the project submission guidelines carefully. All projects must be submitted through the platform by the due date. Include proper documentation and comments in your code. Plagiarism will not be tolerated.",
    audience: "all" as const
  },
  {
    title: "Coding Competition Announcement",
    body: "We're organizing an internal coding competition next month! This is a great opportunity to test your skills and compete with your peers. More details will be shared soon. Start practicing!",
    audience: "all" as const
  },
  {
    title: "Course Materials Update",
    body: "New course materials have been uploaded including video lectures, reading assignments, and practice exercises. Please check the course page regularly for updates and new content.",
    audience: "all" as const
  },
  {
    title: "Final Project Requirements",
    body: "The final project requirements have been posted. You can choose from a list of suggested projects or propose your own. All projects must be approved by the instructor. The deadline for project proposals is April 1st.",
    audience: "all" as const
  }
];

export async function initializeDummyData(ownerUid: string) {
  try {
    console.log('🚀 Initializing dummy data for teacher...');

    // Create courses
    for (const course of dummyCourses) {
      await createCourse({ ownerUid, ...course });
    }
    console.log('✅ Created 10 dummy courses');

    // Create assignments
    for (const assignment of dummyAssignments) {
      await createAssignment({ ownerUid, ...assignment });
    }
    console.log('✅ Created 10 dummy assignments');

    // Create problems
    for (const problem of dummyProblems) {
      await createProblem({ ownerUid, ...problem });
    }
    console.log('✅ Created 10 dummy problems');

    // Create notices
    for (const notice of dummyNotices) {
      await createNotice({ ownerUid, ...notice });
    }
    console.log('✅ Created 10 dummy notices');

    console.log('🎉 Dummy data initialization completed!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing dummy data:', error);
    return false;
  }
}
