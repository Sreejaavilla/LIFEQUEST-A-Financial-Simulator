
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';

// Placeholder component for a feature not yet implemented.
interface InvestmentScreenProps {
    onComplete: () => void;
}

const InvestmentScreen: React.FC<InvestmentScreenProps> = ({ onComplete }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-cyan-300">Investments</h2>
      <p className="text-gray-300 mb-6">
        The investment feature is coming soon! Here you will be able to manage your portfolio,
        buy and sell stocks, and grow your wealth.
      </p>
      <Button onClick={onComplete} text="Return to Game" />
    </Card>
  );
};

export default InvestmentScreen;
