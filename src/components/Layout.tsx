import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string; // Allow additional classes
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="slb-bg min-h-screen flex justify-center items-stretch text-[var(--slb-ink)]">
      <div className={`w-full max-w-[430px] min-w-0 min-h-screen h-screen overflow-hidden flex flex-col relative ${className}`}>
        {children}
      </div>
    </div>
  );
};
