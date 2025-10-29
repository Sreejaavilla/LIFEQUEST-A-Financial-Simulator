import React from 'react';
import type { PlayerState, CrisisState } from '../types';
import { formatCurrency } from '../utils/formatters';
import Card from './common/Card';

interface CrisisHUDProps {
    playerState: PlayerState;
    crisis: CrisisState;
}

const CrisisStat: React.FC<{ label: string; value: string; threshold?: string, isDanger: boolean }> = ({ label, value, threshold, isDanger }) => (
    <div className={`text-center p-3 rounded-lg ${isDanger ? 'bg-red-900/50' : 'bg-gray-800/50'}`}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-xl font-bold ${isDanger ? 'text-red-400' : 'text-white'}`}>{value}</p>
        {threshold && <p className="text-xs text-gray-500">Min: {threshold}</p>}
    </div>
);

const CrisisHUD: React.FC<CrisisHUDProps> = ({ playerState, crisis }) => {
    const progress = (crisis.currentMonth / crisis.duration) * 100;
    const netWorth = playerState.financials.assets - playerState.financials.liabilities + playerState.emergencyFund;

    const isNetWorthDanger = netWorth < crisis.survivalThreshold;
    const isEmergencyFundDanger = playerState.emergencyFund < (playerState.financials.expenses / 12); // Less than 1 month expenses

    return (
        <header className="mb-8">
            <Card className="border-2 border-red-500/30">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-red-400 animate-pulse">{crisis.name}</h1>
                    <p className="text-gray-300">Month {crisis.currentMonth} of {crisis.duration}</p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-4 mb-6 border border-gray-600">
                    <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <CrisisStat 
                        label="Net Worth"
                        value={formatCurrency(netWorth)}
                        threshold={formatCurrency(crisis.survivalThreshold)}
                        isDanger={isNetWorthDanger}
                    />
                     <CrisisStat 
                        label="Emergency Fund"
                        value={formatCurrency(playerState.emergencyFund)}
                        isDanger={isEmergencyFundDanger}
                    />
                     <CrisisStat 
                        label="Happiness"
                        value={`${playerState.happiness}%`}
                        isDanger={playerState.happiness < 40}
                    />
                </div>
            </Card>
        </header>
    );
};

export default CrisisHUD;
