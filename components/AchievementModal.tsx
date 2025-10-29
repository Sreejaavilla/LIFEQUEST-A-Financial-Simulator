import React from 'react';
import type { Achievement } from '../types';
import Card from './common/Card';
import Button from './common/Button';

interface AchievementModalProps {
    achievement: Achievement;
    onClose: () => void;
}

const resources: Record<string, { title: string, url: string }[]> = {
    'Deduction Detective': [
        { title: "Guide to Income Tax Deductions", url: "https://www.incometaxindia.gov.in/pages/tools/deduction-for-individuals.aspx" },
        { title: "Understanding Section 80C", url: "https://cleartax.in/s/80c-deductions" },
    ],
    'Insurance Guardian': [
        { title: "What is Insurance?", url: "https://www.policybazaar.com/insurance-knowledge-base/what-is-insurance/" },
        { title: "Types of Insurance in India", url: "https://www.irdai.gov.in/consumer-affairs/types-of-insurance" },
    ],
    'Recession Survivor': [
        { title: "How to Prepare for a Recession", url: "https://www.investopedia.com/articles/investing/052913/how-prepare-recession.asp" },
        { title: "Navigating a Financial Crisis", url: "https://www.forbes.com/advisor/personal-finance/how-to-get-through-a-financial-crisis/" },
    ]
}

const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, onClose }) => {
  const achievementResources = resources[achievement.name] || [];
  const isBadge = achievement.type === 'badge';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <Card className="max-w-md w-full border-2 border-yellow-400 shadow-2xl shadow-yellow-500/20" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-300">
                    {isBadge ? '🎖️ Badge Earned!' : '🏆 Achievement Unlocked!'}
                </h2>
                <h3 className="text-2xl font-semibold mt-4 text-white">{achievement.name}</h3>
                <p className="text-gray-300 mt-2">{achievement.description}</p>
            </div>
            {achievementResources.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-bold text-lg text-cyan-300 mb-2 text-center">Learn More</h4>
                    <ul className="space-y-2">
                        {achievementResources.map(res => (
                            <li key={res.title}>
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-center text-cyan-400 hover:text-cyan-200 transition-colors">
                                    {res.title} &rarr;
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <Button onClick={onClose} text="Awesome!" className="mt-8 w-full"/>
        </Card>
    </div>
  );
};

export default AchievementModal;
