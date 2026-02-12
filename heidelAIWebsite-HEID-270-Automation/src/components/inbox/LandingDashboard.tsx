import React from 'react';

const LandingDashboard = () => {

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to HeidelAI
        </h1>
        <p className="text-xl text-gray-600">
          Your all-in-one platform for managing customer conversations across multiple channels.
        </p>
      </div>
    </div>
  );
};

export default LandingDashboard;