import React from "react";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Group Activity Instructions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-3">
              Welcome to the Group Activity Session
            </h3>
            <p className="mb-4">
              This document contains the instructions for your group activity.
            </p>
            <h4 className="font-semibold mb-2">Before You Start:</h4>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Ensure you have a stable internet connection</li>
              <li>Check that your camera and microphone are working</li>
              <li>Find a quiet, well-lit space</li>
              <li>Close unnecessary browser tabs for optimal performance</li>
            </ul>
            <h4 className="font-semibold mb-2">During the Activity:</h4>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Click "Start Group Activity" to begin recording</li>
              <li>Grant permission for camera and microphone access</li>
              <li>
                Your session will be recorded for quality and training purposes
              </li>
              <li>Click "Stop Recording" when you're finished</li>
            </ul>
            <h4 className="font-semibold mb-2">Privacy & Security:</h4>
            <p className="mb-4">
              All recordings are encrypted and stored securely. Only authorized
              personnel will have access to your session data. Your privacy is
              our top priority.
            </p>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between">
          <a
            href="http://localhost:5000/public/Group_Activity_Instructions.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="Group_Activity_Instructions.pdf"
            className="btn-secondary"
          >
            Download PDF
          </a>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
