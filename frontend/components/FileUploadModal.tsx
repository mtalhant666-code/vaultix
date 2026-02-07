'use client';

import React, { useRef, useState } from 'react';

interface FileWithStatus {
  file: File | null;
  id: string;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: FileWithStatus[]) => void;
  uploadedFilesStatus?: FileWithStatus[];
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onFilesSelected,
  uploadedFilesStatus = [],
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size > 0
    if (file.size === 0) {
      return { isValid: false, error: '0 byte, empty file' };
    }

    // Check filename not empty
    if (!file.name || file.name.trim().length === 0) {
      return { isValid: false, error: 'Empty filename' };
    }

    return { isValid: true };
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // Add files to state and auto-upload valid ones
  const addFiles = (files: File[]) => {
    const newFiles: FileWithStatus[] = files.map((file) => {
      const validation = validateFile(file);

      return {
        file: validation.isValid ? file : null,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: validation.isValid ? 'uploading' : 'error',
        error: validation.error,
        progress: 0,
      };
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    
    // Auto-upload valid files immediately
    const validFiles = newFiles.filter((f) => f.file !== null);
    if (validFiles.length > 0) {
      // Pass to dashboard to start uploading
      onFilesSelected(validFiles);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  // Remove file from selected files
  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
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

  // Get valid files (not in error state)
  const validFiles = selectedFiles.filter((f) => f.file !== null && f.status !== 'error');
  const hasValidFiles = validFiles.length > 0;

  // Handle cancel - just close modal
  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Page refresh warning */}
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Note:</strong> Page refresh will abort file uploads. File[] will be lost.
              </p>
            </div>
          )}

          {/* Drag and drop zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${
                dragActive
                  ? 'border-black bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">☁️</div>
              <p className="text-gray-900 font-medium">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-black font-semibold underline hover:text-gray-700"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Powered by Cloudflare's global CDN
              </p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />

          {/* Files list */}
          {selectedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">
                  Selected Files ({validFiles.length}/{selectedFiles.length})
                </span>
                {selectedFiles.some((f) => f.status === 'error') && (
                  <span className="text-xs text-red-600 font-medium">
                    {selectedFiles.filter((f) => f.status === 'error').length} file(s) have errors
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((fileItem) => {
                  // Check if this file has a status update from the dashboard
                  const uploadedStatus = uploadedFilesStatus.find((f) => f.id === fileItem.id);
                  const displayFile = uploadedStatus || fileItem;
                  
                  return (
                    <div
                      key={fileItem.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg transition
                        ${
                          displayFile.status === 'error'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Loading spinner for uploading files */}
                        {displayFile.status === 'uploading' ? (
                          <div className="animate-spin text-lg">⏳</div>
                        ) : (
                          <span className="text-xl flex-shrink-0">
                            {displayFile.file ? getFileIcon(displayFile.file.type) : '❌'}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          {displayFile.file ? (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {displayFile.file.name}
                                </p>
                                {displayFile.status === 'uploading' && (
                                  <span className="text-xs font-semibold text-blue-600 ml-2 flex-shrink-0">
                                    {displayFile.progress || 0}%
                                  </span>
                                )}
                              </div>
                              
                              {/* Progress bar for uploading files */}
                              {displayFile.status === 'uploading' && (
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${displayFile.progress || 0}%` }}
                                  />
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-500">
                                {formatFileSize(displayFile.file.size)}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-red-700 truncate">
                                {displayFile.error}
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                File validation failed
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <span
                          className={`
                            text-xs font-medium px-2 py-1 rounded border
                            ${
                              displayFile.status === 'error'
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : displayFile.status === 'uploading'
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : displayFile.status === 'success'
                                    ? 'bg-green-100 text-green-700 border-green-300'
                                    : 'bg-white text-gray-600 border-gray-200'
                            }
                          `}
                        >
                          {displayFile.status === 'uploading' && '⏳ '}
                          {displayFile.status === 'success' && '✓ '}
                          {displayFile.status === 'error' && '✕ '}
                          {displayFile.status}
                        </span>

                        <button
                          onClick={() => removeFile(fileItem.id)}
                          disabled={displayFile.status === 'uploading'}
                          className="text-gray-400 hover:text-red-500 transition p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error summary */}
              {selectedFiles.some((f) => f.status === 'error') && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    ❌ File validation errors:
                  </p>
                  <ul className="text-xs text-red-600 space-y-1">
                    {selectedFiles
                      .filter((f) => f.status === 'error')
                      .map((f) => (
                        <li key={f.id}>
                          • <strong>{f.error}</strong>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Storage info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                FREE TIER
              </span>
              <span className="text-sm text-green-700">
                7.7 GB remaining
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {selectedFiles.some((f) => f.status === 'error') && (
              <p className="text-sm text-orange-600">
                ⚠️ Some files have errors and won't upload
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
