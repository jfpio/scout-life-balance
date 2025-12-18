import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string; // Allow additional classes
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans text-gray-900">
      {/* Mobile container: max-w-md, full height on mobile, shadow on desktop */}
      <div className={`w-full max-w-md h-screen sm:h-[800px] sm:max-h-screen bg-white sm:rounded-3xl shadow-xl overflow-hidden flex flex-col relative ${className}`}>
        {children}
      </div>
    </div>
  );
};
