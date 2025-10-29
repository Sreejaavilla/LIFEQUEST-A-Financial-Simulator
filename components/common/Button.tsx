
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const Button: React.FC<ButtonProps> = ({ text, className = '', ...props }) => {
  return (
    <button
      className={`px-6 py-3 font-bold text-white bg-cyan-600 rounded-lg shadow-lg hover:bg-cyan-500 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;
