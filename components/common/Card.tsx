
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-black/30 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-2xl shadow-black/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
