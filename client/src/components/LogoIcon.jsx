import React from 'react';

export default function LogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Orbital Circles */}
      <circle 
        cx="50" 
        cy="50" 
        r="34" 
        stroke="#2563eb" 
        strokeWidth="2.5" 
        strokeDasharray="160 50" 
        strokeLinecap="round" 
        transform="rotate(-45 50 50)" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="29" 
        stroke="#f59e0b" 
        strokeWidth="2" 
        strokeDasharray="120 60" 
        strokeLinecap="round" 
        transform="rotate(35 50 50)" 
      />
      
      {/* Orbital dots */}
      <circle cx="20" cy="40" r="3.5" fill="#f59e0b" />
      <circle cx="78" cy="65" r="3.5" fill="#3b82f6" />

      {/* Upward Arrow */}
      <path 
        d="M25 75 L70 30" 
        stroke="#14b8a6" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />
      <path 
        d="M58 28 L72 28 L72 42" 
        stroke="#14b8a6" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Stacked Isometric Cubes (representing Inventory products ascending) */}
      {/* Cube 1 (Bottom Left) */}
      <g transform="translate(24, 60)">
        <path d="M0 -6 L8 -10 L16 -6 L8 -2 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="1" />
        <path d="M0 -6 L0 4 L8 8 L8 -2 Z" fill="#1e40af" stroke="#0f172a" strokeWidth="1" />
        <path d="M8 -2 L8 8 L16 4 L16 -6 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1" />
      </g>
      {/* Cube 2 (Middle) */}
      <g transform="translate(38, 46)">
        <path d="M0 -6 L8 -10 L16 -6 L8 -2 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1" />
        <path d="M0 -6 L0 4 L8 8 L8 -2 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
        <path d="M8 -2 L8 8 L16 4 L16 -6 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="1" />
      </g>
      {/* Cube 3 (Top Right) */}
      <g transform="translate(52, 32)">
        <path d="M0 -6 L8 -10 L16 -6 L8 -2 Z" fill="#60a5fa" stroke="#0f172a" strokeWidth="1" />
        <path d="M0 -6 L0 4 L8 8 L8 -2 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1" />
        <path d="M8 -2 L8 8 L16 4 L16 -6 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
      </g>
    </svg>
  );
}
