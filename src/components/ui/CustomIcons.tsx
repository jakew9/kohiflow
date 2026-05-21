import React from "react";

export const ChemexIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Top Triangle (Inverted) */}
    <path d="M5 4L19 4L12 12L5 4Z" />
    {/* Bottom Triangle (Regular) */}
    <path d="M12 12L19 20L5 20L12 12Z" />
    {/* Waist Line (the wood collar) */}
    <path d="M10 12H14" strokeWidth="2" />
  </svg>
);

export const MokaPotIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Top Chamber */}
    <path d="M8 4L16 4L17 11L7 11L8 4Z" />
    {/* Bottom Chamber */}
    <path d="M7 11L6 20L18 20L17 11" />
    {/* Handle */}
    <path d="M16 6C18 6 20 8 20 10C20 12 18 14 16 14" />
    {/* Spout */}
    <path d="M7 6L5 7" />
    {/* Top Knob */}
    <path d="M11 3H13" />
  </svg>
);
