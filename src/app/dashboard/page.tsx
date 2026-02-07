'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadModal from '@/frontend/components/FileUploadModal';

interface FileWithStatus {
  file: File | null;
  id: string;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number; // 0-100
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithStatus[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // TODO: Fetch user data from /api/me endpoint
    // For now, just mark as loaded
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/auth/login');
  };

  const handleFilesSelected = (files: FileWithStatus[]) => {
    // Create new file entries with uploading status
    const newFiles = files.map((f) => ({
      file: f.file,
      id: f.id,
      status: 'uploading' as const,
      progress: 0,
    }));
    
    // Add to uploaded files list
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    // Start uploading all files immediately
    newFiles.forEach((fileItem) => {
      uploadFile(fileItem);
    });
  };

  // Upload a single file to backend with REAL progress tracking
  const uploadFile = async (fileItem: FileWithStatus) => {
    if (!fileItem.file) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use XMLHttpRequest to get REAL progress events
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track real upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, progress: Math.round(percentComplete) }
                  : f
              )
            );
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? { ...f, status: 'success' as const, progress: 100 }
                  : f
              )
            );
            resolve(null);
          } else {
            throw new Error('Upload failed with status ' + xhr.status);
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: 'error' as const,
                    error: 'Upload failed',
                    progress: undefined,
                  }
                : f
            )
          );
          reject(new Error('Upload failed'));
        });

        // Handle abort
        xhr.addEventListener('abort', () => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: 'error' as const,
                    error: 'Upload cancelled',
                    progress: undefined,
                  }
                : f
            )
          );
          reject(new Error('Upload cancelled'));
        });

        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('filename', fileItem.file.name);

        // Set up and send request
        xhr.open('POST', '/api/files/upload', true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (err) {
      // Update status to error
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'error' as const,
                error: err instanceof Error ? err.message : 'Upload failed',
                progress: undefined,
              }
            : f
        )
      );
    }
  };

  // Remove file from list
  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('zip')) return '📦';
    return '📎';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">V</span>
            </div>
            <span className="text-2xl font-bold">Vaultix</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="mb-8">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            + Upload Files
          </button>
        </div>

        {/* Files List */}
        {uploadedFiles.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Your Files ({uploadedFiles.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {uploadedFiles.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="p-4 hover:bg-gray-50 transition flex items-center justify-between border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* File icon or loading spinner */}
                    <span className="text-2xl flex-shrink-0">
                      {fileItem.status === 'uploading' ? (
                        <span className="animate-spin inline-block">⏳</span>
                      ) : fileItem.file ? (
                        getFileIcon(fileItem.file.type)
                      ) : (
                        '❌'
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {fileItem.file?.name || fileItem.error}
                        </p>
                        {fileItem.status === 'uploading' && (
                          <span className="text-xs font-semibold text-blue-600 ml-2 flex-shrink-0">
                            {fileItem.progress || 0}%
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {fileItem.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem.progress || 0}%` }}
                          />
                        </div>
                      )}

                      {/* File details */}
                      {fileItem.status !== 'uploading' && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {fileItem.file ? formatFileSize(fileItem.file.size) : 'Invalid'}
                          </span>
                          <span
                            className={`
                              text-xs font-medium px-2 py-1 rounded
                              ${
                                fileItem.status === 'success'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            `}
                          >
                            {fileItem.status === 'success' && '✓ '}
                            {fileItem.status === 'error' && '✕ '}
                            {fileItem.status}
                          </span>
                        </div>
                      )}

                      {/* Error message */}
                      {fileItem.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {fileItem.status === 'error' && (
                      <button
                        onClick={() => uploadFile(fileItem)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        title="Retry upload"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded"
                      title="Remove file"
                      disabled={fileItem.status === 'uploading'}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard</h1>
            <p className="text-gray-600 mb-8">
              Your storage is set up and ready to use. Start uploading your files now!
            </p>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium mb-12"
            >
              + Upload Files
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-2">📁</div>
                <h3 className="font-semibold mb-2">Files</h3>
                <p className="text-gray-600 text-sm">Manage your uploaded files</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-semibold mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Encrypted and secure storage</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Fast CDN</h3>
                <p className="text-gray-600 text-sm">Global content delivery network</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        uploadedFilesStatus={uploadedFiles}
      />
    </div>
  );
}
