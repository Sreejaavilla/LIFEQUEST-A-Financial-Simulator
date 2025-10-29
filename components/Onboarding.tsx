import React, { useState, useMemo } from 'react';
import type { PlayerProfile } from '../types';
import { AVATAR_OPTIONS, CAREER_OPTIONS } from '../constants';
import { formatCurrency } from '../utils/formatters';
import Button from './common/Button';
import Card from './common/Card';

interface OnboardingProps {
  onComplete: (profile: PlayerProfile) => void;
}

const AvatarPicker = ({ selected, onSelect }: { selected: string, onSelect: (id: string) => void }) => (
  <div className="flex justify-center gap-4">
    {AVATAR_OPTIONS.map(id => (
      <div 
        key={id}
        onClick={() => onSelect(id)}
        className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${selected === id ? 'bg-cyan-500 ring-4 ring-cyan-300' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
    ))}
  </div>
);

const FutureSelfPredictor = ({ monthlySalary }: { monthlySalary: number }) => {
  const { netWorth, emergencyMonths, recommendation } = useMemo(() => {
    const initialNetWorth = monthlySalary * 2;
    const yearlySavings = (monthlySalary * 0.20) * 12;
    const projectedNetWorth = initialNetWorth + yearlySavings;
    
    const monthlyExpenses = monthlySalary * 0.80;
    const projectedEmergencyMonths = monthlyExpenses > 0 ? yearlySavings / monthlyExpenses : 0;

    let rec = "A solid start to your financial journey!";
    if (monthlySalary < 50000) {
        rec = "Focus on growing your income and savings rate.";
    } else if (monthlySalary > 150000) {
        rec = "Your high income is a powerful wealth-building tool. Invest wisely!";
    }

    return {
      netWorth: projectedNetWorth,
      emergencyMonths: projectedEmergencyMonths,
      recommendation: rec,
    };
  }, [monthlySalary]);

  return (
    <Card className="border-cyan-400/30">
        <h3 className="text-xl font-bold text-center mb-4 text-cyan-300">Future-Self Predictor</h3>
        <div className="space-y-3 text-center">
            <div>
                <p className="text-gray-400 text-sm">Projected Net Worth (1 Year)</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(netWorth)}</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Emergency Fund (1 Year)</p>
                <p className="text-2xl font-bold text-yellow-400">{emergencyMonths.toFixed(1)} months</p>
            </div>
            <p className="text-sm text-gray-300 pt-2 italic">"{recommendation}"</p>
        </div>
    </Card>
  );
};


const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [career, setCareer] = useState(CAREER_OPTIONS[0]);
  const [monthlySalary, setMonthlySalary] = useState(50000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({
        name: name.trim(),
        avatar,
        career,
        monthlySalary,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-5xl font-bold mb-2 text-center text-cyan-300 tracking-tighter">LifeQuest</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">Create Your Financial Avatar</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Alex" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
              </div>
              <div>
                <label htmlFor="career" className="block text-sm font-medium text-gray-300 mb-1">Choose Career</label>
                <select id="career" value={career} onChange={(e) => setCareer(e.target.value)} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                  {CAREER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-1">Monthly Salary</label>
                <div className="flex items-center gap-4">
                  <input type="range" id="salary" min="20000" max="300000" step="5000" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  <span className="font-bold text-cyan-300 w-28 text-right">{formatCurrency(monthlySalary)}</span>
                </div>
              </div>
            </div>
          </Card>
          
          <FutureSelfPredictor monthlySalary={monthlySalary} />

          <Button type="submit" text="Begin My Life" className="w-full !py-4 text-lg" disabled={!name.trim()} />
        </form>
      </div>
    </div>
  );
};

export default Onboarding;