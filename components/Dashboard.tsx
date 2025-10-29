import React, { useRef } from 'react';
import type { PlayerState, Achievement } from '../types';
import { formatCurrency } from '../utils/formatters';
import Card from './common/Card';
import Button from './common/Button';
import { XP_PER_LEVEL } from '../constants';

interface DashboardProps {
  playerState: PlayerState;
  onManageInsurance: () => void;
  onOpenSkillTree: () => void;
  onOpenPresenterTools: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; className?: string, children?: React.ReactNode }> = ({ label, value, className, children }) => (
    <div className={`p-4 bg-gray-800/50 rounded-lg text-center ${className}`}>
        <p className="text-sm text-gray-400">{label}</p>
        {children || <p className="text-xl md:text-2xl font-bold">{value}</p>}
    </div>
);

const XPBar: React.FC<{ xp: number; level: number }> = ({ xp, level }) => {
    const currentLevelXp = (level - 1) * XP_PER_LEVEL;
    const xpIntoLevel = xp - currentLevelXp;
    const progress = (xpIntoLevel / XP_PER_LEVEL) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-bold text-cyan-300">Level {level}</p>
                <p className="text-xs text-gray-400">{xp} / {level * XP_PER_LEVEL} XP</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

const BadgeDisplay: React.FC<{ badges: Achievement[] }> = ({ badges }) => {
    if (badges.length === 0) return null;
    return (
        <div className="mt-4">
            <h3 className="text-center text-sm font-bold text-yellow-300 mb-2">Badges</h3>
            <div className="flex justify-center items-center gap-2">
                {badges.map(badge => (
                     <div key={badge.name} className="group relative">
                        <span className="text-2xl" title={badge.name}>🏆</span>
                        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="font-bold">{badge.name}</p>
                            <p>{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ playerState, onManageInsurance, onOpenSkillTree, onOpenPresenterTools, onExport, onImport }) => {
  const { name, age, career, financials, xp, level, happiness, creditScore, emergencyFund, achievements, stage } = playerState;
  const netWorth = financials.assets - financials.liabilities + emergencyFund;
  const badges = achievements.filter(a => a.type === 'badge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHappinessEmoji = () => {
      if (happiness > 80) return '😃';
      if (happiness > 60) return '😊';
      if (happiness > 40) return '😐';
      if (happiness > 20) return '😟';
      return '😫';
  }
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const text = e.target?.result;
              if (typeof text === 'string') {
                  onImport(text);
              }
          };
          reader.readAsText(file);
          // Reset file input to allow importing the same file again
          event.target.value = '';
      }
  };


  return (
    <header>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-cyan-500 ring-4 ring-cyan-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{name}</h1>
                    <p className="text-cyan-300">{age} years old | {career.name} <span className="text-yellow-300">({stage})</span></p>
                </div>
            </div>
             <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                <Button onClick={handleImportClick} text="Import" className="!py-1 !px-3 text-xs" />
                <Button onClick={onExport} text="Export" className="!py-1 !px-3 text-xs" />
            </div>
            <div className="text-center sm:text-right">
                <p className="text-sm text-gray-400">Net Worth</p>
                <p className="text-4xl font-bold text-green-400">{formatCurrency(netWorth)}</p>
            </div>
        </div>
        <Card className="mb-6">
            <XPBar xp={xp} level={level} />
            <BadgeDisplay badges={badges} />
        </Card>
        <div className="grid md:grid-cols-5 gap-4">
            <Card className="md:col-span-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                    <StatCard label="Yearly Income" value={formatCurrency(financials.income)} className="text-green-400" />
                    <StatCard label="Yearly Expenses" value={formatCurrency(financials.expenses)} className="text-red-400" />
                    <StatCard label="Invested Assets" value={formatCurrency(financials.assets)} className="text-yellow-400" />
                    <StatCard label="Emergency Fund" value={formatCurrency(emergencyFund)} className="text-teal-400" />
                    <StatCard label="Liabilities" value={formatCurrency(financials.liabilities)} className="text-orange-400" />
                    <StatCard label="Credit Score" value={creditScore} className="text-indigo-400" />
                    <StatCard label="Happiness" value="">
                        <p className="text-3xl font-bold">{getHappinessEmoji()} <span className="text-xl align-middle">({happiness}%)</span></p>
                    </StatCard>
                </div>
            </Card>
            <Card className="md:col-span-1 flex flex-col justify-center gap-2">
                <h3 className="text-lg font-bold text-center text-white mb-1">Actions</h3>
                <Button onClick={onManageInsurance} text="Manage Insurance" className="w-full text-sm !py-2"/>
                <Button onClick={onOpenSkillTree} text="Skill Tree" className="w-full text-sm !py-2" />
                <Button onClick={onOpenPresenterTools} text="Presenter Tools" className="w-full text-sm !py-2 !bg-indigo-600 hover:!bg-indigo-500" />
            </Card>
        </div>
    </header>
  );
};

export default Dashboard;