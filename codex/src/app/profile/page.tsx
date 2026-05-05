"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  BookOpen,
  Target,
  Star,
  Users
} from "lucide-react";

interface UserProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bio: string;
  
  // Academic Information
  institution: string;
  department: string;
  degree: string;
  major: string;
  graduationYear: string;
  gpa: string;
  
  // Professional Information
  jobTitle: string;
  company: string;
  experience: string;
  employeeId?: string;
  studentId?: string;
  linkedIn: string;
  github: string;
  
  // Skills and Interests
  programmingLanguages: string[];
  frameworks: string[];
  interests: string[];
  
  // Profile Settings
  profilePicture: string;
  isPublic: boolean;
  emailNotifications: boolean;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  bio: '',
  institution: '',
  department: '',
  degree: '',
  major: '',
  graduationYear: '',
  gpa: '',
  jobTitle: '',
  company: '',
  experience: '',
  employeeId: '',
  studentId: '',
  linkedIn: '',
  github: '',
  programmingLanguages: [],
  frameworks: [],
  interests: [],
  profilePicture: '',
  isPublic: true,
  emailNotifications: true
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !hasFirebaseConfig()) {
        setIsLoading(false);
        return;
      }
      try {
        const { db } = getFirebase();
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setProfile(prev => ({
            ...prev,
            ...data,
            email: data.email || user.email || '',
            profilePicture: data.profilePicture || user.photoURL || ''
          }));
        } else {
          setProfile(prev => ({
            ...prev,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            email: user.email || '',
            profilePicture: user.photoURL || ''
          }));
        }
      } catch (e) {
        console.warn("Failed to load profile", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user || !hasFirebaseConfig()) return;
      const { db } = getFirebase();
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { ...profile, uid: user.uid, email: profile.email || user.email, updatedAt: serverTimestamp() }, { merge: true });
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save profile", e);
      alert("Could not save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset changes if needed
  };

  const addSkill = (category: keyof Pick<UserProfile, 'programmingLanguages' | 'frameworks' | 'interests'>, skill: string) => {
    if (skill && !profile[category].includes(skill)) {
      setProfile(prev => ({
        ...prev,
        [category]: [...prev[category], skill]
      }));
    }
  };

  const removeSkill = (category: keyof Pick<UserProfile, 'programmingLanguages' | 'frameworks' | 'interests'>, skill: string) => {
    setProfile(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s !== skill)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                      <Camera size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">
                    {user?.userType === 'teacher' ? 'Instructor' : 'Student'} • {profile.institution || 'CODEX Platform'}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Mail size={16} />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone size={16} />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                      <Save size={18} />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    <Edit3 size={18} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <User size={24} className="mr-3 text-indigo-600" />
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.firstName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.lastName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.dateOfBirth || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <GraduationCap size={24} className="mr-3 text-indigo-600" />
                Academic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institution
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.institution}
                      onChange={(e) => setProfile(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.institution || 'Not provided'}</p>
                  )}
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.department || 'Not provided'}</p>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Degree
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.degree}
                      onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.degree || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Major
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.major}
                      onChange={(e) => setProfile(prev => ({ ...prev, major: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.major || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GPA
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.gpa}
                      onChange={(e) => setProfile(prev => ({ ...prev, gpa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.gpa || 'Not provided'}</p>
                  )}
                </div>

              {user?.userType === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.employeeId || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.employeeId || 'Not provided'}</p>
                  )}
                </div>
              )}

              {user?.userType === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.studentId || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile.studentId || 'Not provided'}</p>
                  )}
                </div>
              )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">4.7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award size={16} className="text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Achievements</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">8</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Code size={20} className="mr-2 text-indigo-600" />
                Skills
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Programming Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'].map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frameworks
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'Express', 'Next.js'].map((framework) => (
                      <span key={framework} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}







