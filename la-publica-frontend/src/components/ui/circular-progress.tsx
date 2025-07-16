import React from "react";

interface CircularProgressProps {
  value: number;  // Progress value (0-100)
  size?: number;  // Diameter in px
  strokeWidth?: number;  // Stroke width in px
  color?: string;  // Stroke color
  bgColor?: string;  // Background circle color
  className?: string;
}

 // Circular progress indicator using SVG
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 96,
  strokeWidth = 8,
  color = "#3b82f6",  // Tailwind blue-500
  bgColor = "#e5e7eb",  // Tailwind gray-200
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        { /* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        { /* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      { /* Percentage text */}
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 select-none">
        {Math.round(value)}%
      </span>
    </div>
  );
}; 