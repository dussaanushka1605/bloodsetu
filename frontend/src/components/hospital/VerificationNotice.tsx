import React from 'react';

interface VerificationNoticeProps {
  isVerified: boolean;
}

const VerificationNotice: React.FC<VerificationNoticeProps> = ({ isVerified }) => {
  if (isVerified) return null;
  
  return (
    <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
      <h2 className="font-semibold text-lg mb-2">Verification Required</h2>
      <p>Your hospital account is pending verification by an administrator. Once verified, you will gain access to all features including:</p>
      <ul className="list-disc ml-5 mt-2">
        <li>Creating blood requests</li>
        <li>Finding and contacting donors</li>
        <li>Managing donation activities</li>
      </ul>
      <p className="mt-2">This verification process usually takes 1-2 business days. Thank you for your patience.</p>
    </div>
  );
};

export default VerificationNotice;
