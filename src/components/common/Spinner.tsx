import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-slate-700 border-t-indigo-500 rounded-full animate-spin`}
      role="status"
      aria-label="loading"
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};
export default Spinner;
