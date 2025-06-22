
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};
