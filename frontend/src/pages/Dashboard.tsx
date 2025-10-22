import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { recordingsApi } from "../api/recordings";
import { ConsentModal } from "../components/ConsentModal";
import { PDFModal } from "../components/PDFModal";
import { useAuth } from "../contexts/AuthContext";
import { useMediaRecorder } from "../hooks/useMediaRecorder";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const {
    isRecording,
    recordedBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useMediaRecorder();

  const uploadMutation = useMutation({
    mutationFn: (blob: Blob) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      return recordingsApi.uploadRecording(blob, user.id);
    },
    onSuccess: () => {
      setUploadSuccess(true);
      clearRecording();
      // Refetch recordings after successful upload
      recordingsQuery.refetch();
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
    },
  });

  // Fetch user's recordings
  const recordingsQuery = useQuery({
    queryKey: ["recordings", user?.id],
    queryFn: () => {
      if (!user) throw new Error("User not authenticated");
      return recordingsApi.getUserRecordings(user.id);
    },
    enabled: !!user,
  });

  // Delete recording mutation
  const deleteMutation = useMutation({
    mutationFn: (recordingId: number) => {
      return recordingsApi.deleteRecording(recordingId);
    },
    onSuccess: () => {
      setDeleteSuccess(true);
      // Refetch recordings after successful delete
      recordingsQuery.refetch();
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    },
  });

  const handleStartActivity = (): void => {
    setShowConsentModal(true);
  };

  const handleConsentAccept = async (): Promise<void> => {
    setShowConsentModal(false);
    await startRecording();
  };

  const handleConsentDecline = (): void => {
    setShowConsentModal(false);
  };

  const handleStopRecording = (): void => {
    stopRecording();
  };

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const handleDeleteRecording = (recordingId: number): void => {
    if (
      window.confirm(
        "Are you sure you want to delete this recording? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(recordingId);
    }
  };

  React.useEffect(() => {
    if (recordedBlob && !uploadMutation.isPending) {
      uploadMutation.mutate(recordedBlob);
    }
  }, [recordedBlob]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WonderTech</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-primary-50 border-l-4 border-primary-600 p-4 mb-8 rounded-r-lg">
          <h2 className="text-xl font-semibold text-primary-900">
            Welcome, {user.name}!
          </h2>
          <p className="text-primary-700 mt-1">
            You're all set to start your group activity session.
          </p>
        </div>

        {/* Instructions */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overview Instructions
          </h3>
          <p className="text-gray-700 mb-4">
            This platform allows you to conduct and record group activities with
            ease. Before starting, please review the detailed instructions to
            ensure a smooth session.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPDFModal(true)}
              className="btn-secondary"
            >
              View Instructions
            </button>
            <a
              href="http://localhost:5000/public/Group_Activity_Instructions.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open PDF in New Window
            </a>
          </div>
        </div>

        {/* Recording Section */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Group Activity Recording
          </h3>

          {!isRecording && !recordedBlob && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                Click the button below to start your group activity session.
              </p>
              <button
                onClick={handleStartActivity}
                className="btn-success text-lg px-8 py-3"
              >
                Start Group Activity
              </button>
            </div>
          )}

          {isRecording && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full">
                  <div className="w-4 h-4 bg-danger-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Recording in Progress
              </p>
              <p className="text-gray-600 mb-6">
                Your session is being recorded. Click stop when you're finished.
              </p>
              <button
                onClick={handleStopRecording}
                className="btn-danger text-lg px-8 py-3"
              >
                Stop Recording
              </button>
            </div>
          )}

          {uploadMutation.isPending && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              </div>
              <p className="text-gray-700">Uploading recording...</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              Recording uploaded successfully! You can start a new session.
            </div>
          )}

          {(recordingError ?? uploadMutation.error) && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              Error:{" "}
              {recordingError ??
                (uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : "An error occurred")}
            </div>
          )}
        </div>

        {/* My Recordings Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              My Recordings
            </h3>
            <button
              onClick={() => recordingsQuery.refetch()}
              disabled={recordingsQuery.isLoading}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              {recordingsQuery.isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {recordingsQuery.isLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="text-gray-700 mt-2">Loading recordings...</p>
            </div>
          )}

          {recordingsQuery.error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
              Error loading recordings:{" "}
              {recordingsQuery.error instanceof Error
                ? recordingsQuery.error.message
                : "Unknown error"}
            </div>
          )}

          {deleteSuccess && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg mb-4">
              Recording deleted successfully!
            </div>
          )}

          {deleteMutation.error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
              Error deleting recording:{" "}
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "Unknown error"}
            </div>
          )}

          {recordingsQuery.data &&
            recordingsQuery.data.recordings.length === 0 && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">No recordings yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start your first group activity to create a recording
                </p>
              </div>
            )}

          {recordingsQuery.data &&
            recordingsQuery.data.recordings.length > 0 && (
              <div className="space-y-4">
                {recordingsQuery.data.recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-primary-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Recording #{recording.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(recording.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`http://localhost:5000/uploads/${recording.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          View
                        </a>
                        <a
                          href={`http://localhost:5000/uploads/${recording.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`recording-${recording.id}.webm`}
                          className="btn-primary text-sm"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteRecording(recording.id)}
                          disabled={deleteMutation.isPending}
                          className="btn-danger text-sm disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      {/* Modals */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
      <PDFModal isOpen={showPDFModal} onClose={() => setShowPDFModal(false)} />
    </div>
  );
};
