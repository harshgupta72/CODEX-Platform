"use client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Download, 
  FileText, 
  Video, 
  Image, 
  Archive,
  Trash2,
  Eye,
  Calendar,
  User,
  File,
  Plus,
  X
} from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface CourseFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'archive';
  size: number;
  uploadDate: string;
  uploadedBy: string;
  url: string;
  description?: string;
  category: 'lecture' | 'assignment' | 'resource' | 'notes';
}

interface CourseContentProps {
  courseId: string;
  courseName: string;
  isTeacher?: boolean;
}

// Mock data - replace with actual API calls
const mockFiles: CourseFile[] = [
  {
    id: '1',
    name: 'Introduction to Data Structures.pdf',
    type: 'pdf',
    size: 2500000,
    uploadDate: '2024-10-01T10:00:00Z',
    uploadedBy: 'Dr. Sarah Johnson',
    url: '/mock-files/intro-ds.pdf',
    description: 'Comprehensive introduction to basic data structures including arrays, linked lists, and stacks.',
    category: 'lecture'
  },
  {
    id: '2',
    name: 'Binary Tree Implementation.mp4',
    type: 'video',
    size: 150000000,
    uploadDate: '2024-10-02T14:30:00Z',
    uploadedBy: 'Dr. Sarah Johnson',
    url: '/mock-files/binary-tree.mp4',
    description: 'Video lecture demonstrating binary tree implementation in Python.',
    category: 'lecture'
  },
  {
    id: '3',
    name: 'Assignment 1 - Array Problems.pdf',
    type: 'pdf',
    size: 800000,
    uploadDate: '2024-09-30T09:00:00Z',
    uploadedBy: 'Dr. Sarah Johnson',
    url: '/mock-files/assignment-1.pdf',
    description: 'Practice problems focusing on array manipulation and algorithms.',
    category: 'assignment'
  }
];

export function CourseContent({ courseId, courseName, isTeacher = false }: CourseContentProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<CourseFile[]>(mockFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CourseFile['category'] | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: CourseFile['type']) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText size={20} className="text-red-500" />;
      case 'video':
        return <Video size={20} className="text-blue-500" />;
      case 'image':
        return <Image size={20} className="text-green-500" />;
      case 'archive':
        return <Archive size={20} className="text-purple-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: CourseFile['category']) => {
    switch (category) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assignment':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'resource':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'notes':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(uploadedFiles).map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' as const : 
              file.type.includes('video') ? 'video' as const :
              file.type.includes('image') ? 'image' as const : 'document' as const,
        size: file.size,
        uploadDate: new Date().toISOString(),
        uploadedBy: user?.displayName || 'Unknown',
        url: URL.createObjectURL(file),
        category: 'resource' as const
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
      setShowUploadModal(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const handleDownload = (file: CourseFile) => {
    // In a real app, this would download from a secure URL
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => file.category === selectedCategory);

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Course Materials</h2>
            <p className="text-indigo-100">{courseName}</p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Upload Files</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {(['all', 'lecture', 'assignment', 'resource', 'notes'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-2 px-2 py-0.5 bg-gray-300 dark:bg-gray-600 text-xs rounded-full">
                {category === 'all' ? files.length : files.filter(f => f.category === category).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="p-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No files found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isTeacher ? 'Upload some files to get started.' : 'No materials have been uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h4>
                    {file.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${getCategoryColor(file.category)}`}>
                        {file.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{file.uploadedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDate(file.uploadDate)}</span>
                      </div>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  {isTeacher && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload Course Materials
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    PDF, DOC, PPT, MP4, ZIP files up to 100MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.zip,.rar"
                />

                {isUploading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}























