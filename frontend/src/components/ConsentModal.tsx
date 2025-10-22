import React from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recording Consent
        </h2>
        <div className="mb-6 space-y-3 text-gray-700">
          <p>To start the group activity, we need your permission to access:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Your camera (video)</li>
            <li>Your microphone (audio)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            The recording will be saved securely and associated with your
            account. You can stop the recording at any time.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onDecline} className="btn-secondary">
            Decline
          </button>
          <button onClick={onAccept} className="btn-primary">
            Accept & Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};
