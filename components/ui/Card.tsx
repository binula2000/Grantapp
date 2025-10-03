
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
