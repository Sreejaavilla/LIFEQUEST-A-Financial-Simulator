import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { CRISIS_REWARDS } from '../constants';

interface CrisisResultScreenProps {
    result: 'won' | 'lost';
    onRollback: () => void;
    onContinue: () => void;
}

const CrisisResultScreen: React.FC<CrisisResultScreenProps> = ({ result, onRollback, onContinue }) => {
    const isWin = result === 'won';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className={`max-w-md w-full border-2 ${isWin ? 'border-green-500' : 'border-red-500'}`} onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    {isWin ? (
                        <>
                            <h1 className="text-4xl font-bold text-green-400 mb-4">Crisis Survived!</h1>
                            <p className="text-gray-300 mb-6">You navigated the treacherous economic landscape with skill and resilience. The storm has passed, and you've emerged stronger.</p>
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h3 className="text-lg font-bold text-yellow-300 mb-2">Rewards</h3>
                                <p className="text-white">+{CRISIS_REWARDS.victoryXp} XP</p>
                                <p className="text-white">🏆 Badge: {CRISIS_REWARDS.badge.name}</p>
                            </div>
                            <Button text="Continue to Next Year" onClick={onContinue} className="w-full mt-8" />
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold text-red-400 mb-4">Overwhelmed by the Crisis</h1>
                            <p className="text-gray-300 mb-6">The economic pressure was too great, and your financial safety nets have failed. This is a major setback, but not the end.</p>
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h3 className="text-lg font-bold text-yellow-300 mb-2">Astra's Advice</h3>
                                <p className="text-gray-300 italic">"Failure is a lesson in disguise. Analyze what went wrong, reconsider your strategy, and you can overcome this."</p>
                            </div>
                            <Button text="Try This Month Again" onClick={onRollback} className="w-full mt-8" />
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CrisisResultScreen;
