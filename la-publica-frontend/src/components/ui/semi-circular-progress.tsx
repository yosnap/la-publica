import React from "react";

interface SemiCircularProgressProps {
  value: number;  // Progress value (0-100)
  size?: number;  // Width of the gauge in px
  strokeWidth?: number;  // Stroke width in px
  color?: string;  // Progress color
  bgColor?: string;  // Background color
  className?: string;
  children?: React.ReactNode;  // Optional children to render below the percentage
}

 // Semi-circular progress indicator (gauge) using SVG
export const SemiCircularProgress: React.FC<SemiCircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  color = "#4F8FF7",  // Tailwind blue-600
  bgColor = "#e5e7eb",  // Tailwind gray-200
  className = "",
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size / 2 + 32 }}>
      <svg width={size} height={size  / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        { /* Background arc */}
        <path
          d={`M ${strokeWidth  / 2},${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2},${radius + strokeWidth / 2}`}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        { /* Progress arc */}
        <path
          d={`M ${strokeWidth  / 2},${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2},${radius + strokeWidth / 2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      { /* Percentage text centered in the gauge */}
      <span className="absolute left-0 right-0 top-[38%] flex items-center justify-center text-3xl font-bold text-gray-900 select-none">
        {Math.round(progress)}%
      </span>
      { /* Optional children below the percentage */}
      {children && (
        <span className="absolute left-0 right-0 top-[62%] flex items-center justify-center w-full">
          {children}
        </span>
      )}
    </div>
  );
}; 