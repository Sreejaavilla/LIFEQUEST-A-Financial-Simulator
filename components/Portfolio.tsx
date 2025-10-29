import React from 'react';
import Card from './common/Card';
import type { PortfolioItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PortfolioProps {
    portfolio: PortfolioItem[];
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio }) => {
  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Your Portfolio</h3>
      {portfolio && portfolio.length > 0 ? (
        <div className="space-y-3">
          {portfolio.map((item, index) => (
            <div key={index} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.type}</p>
                </div>
                <p className="font-bold text-cyan-300">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-400">
          <p>No investments yet.</p>
          <p className="text-sm">Start investing to see your portfolio here.</p>
        </div>
      )}
    </Card>
  );
};

export default Portfolio;
