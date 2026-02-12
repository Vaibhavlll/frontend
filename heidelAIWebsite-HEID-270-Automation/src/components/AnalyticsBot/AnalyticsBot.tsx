import React from 'react';
import ComingSoon from '../shared/ComingSoon';

const AnalyticsBot = () => {
  return (
    <div className="flex flex-col h-dvh min-h-screen w-full text-slate-900 font-sans overflow-hidden bg-white">
      {/* Coming Soon Content */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <ComingSoon
          description="We're building something amazing. Analytics Bot will provide deep insights across multiple platforms, helping you understand trends, sentiments, and performance metrics with ease."
        />
      </main>
    </div>
  );
};

export default AnalyticsBot;

