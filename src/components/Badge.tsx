
import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'green' | 'orange' | 'blue' | 'red';
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'green' }) => {
  const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full text-white inline-block";
  
  const variants = {
    green: "bg-brand-green",
    orange: "bg-brand-orange",
    blue: "bg-brand-blue",
    red: "bg-brand-red",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]}`}>
      {text}
    </span>
  );
};
