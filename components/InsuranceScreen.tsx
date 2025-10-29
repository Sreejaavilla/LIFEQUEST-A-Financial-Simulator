import React from 'react';
import type { PlayerState, InsurancePolicy } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { formatCurrency } from '../utils/formatters';
import { calculateRiskExposure } from '../utils/riskCalculator';
import { INSURANCE_PRODUCTS } from '../constants';

interface InsuranceScreenProps {
    playerState: PlayerState;
    onBuy: (policy: Omit<InsurancePolicy, 'activeUntilAge'>) => void;
    onClose: () => void;
}

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const rotation = (score / 100) * 180 - 90;
    const color = score > 66 ? 'text-red-500' : score > 33 ? 'text-yellow-400' : 'text-green-400';

    return (
        <div className="relative w-48 h-24 mx-auto mb-2">
            <div className="absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-r-8 border-gray-700 rounded-t-full"></div>
            <div className={`absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-r-8 ${color.replace('text-', 'border-')} rounded-t-full`} style={{ clipPath: `inset(0 ${100 - score}% 0 0)` }}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <div className={`text-4xl font-bold ${color}`}>{score}</div>
                <div className="text-sm text-gray-400">Risk Score</div>
            </div>
        </div>
    );
};


const InsuranceScreen: React.FC<InsuranceScreenProps> = ({ playerState, onBuy, onClose }) => {
    const riskExposure = calculateRiskExposure(playerState);

    const getAstraHint = () => {
        if (riskExposure > 66) {
            return "Your current risk exposure is high. Unexpected events could be financially devastating. Securing insurance for your key assets is highly recommended to build a safety net.";
        }
        if (riskExposure > 33) {
            return "You have a moderate level of risk. While your finances are decent, a major setback could derail your progress. Consider insurance to protect against your biggest vulnerabilities.";
        }
        return "Your risk exposure is low. Great job on building a stable financial foundation! While no one is immune to risk, you're in a strong position. Review if any policies can cover remaining gaps.";
    };

    const hasPolicy = (type: string) => {
        return playerState.insurance.some(p => p.type === type && p.activeUntilAge > playerState.age);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <Card className="max-w-4xl w-full border-2 border-cyan-500/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-cyan-300">Insurance Marketplace</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Panel: Risk & Astra */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-gray-900/50">
                            <h2 className="text-xl font-bold text-center mb-4">Your Risk Exposure</h2>
                            <RiskGauge score={riskExposure} />
                        </Card>
                        <Card className="bg-gray-900/50">
                            <h3 className="text-lg font-bold text-yellow-300 mb-2">Astra's Advice</h3>
                            <p className="text-sm text-gray-300 italic">"{getAstraHint()}"</p>
                        </Card>
                    </div>

                    {/* Right Panel: Products */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Available Policies</h2>
                        <div className="space-y-4">
                            {INSURANCE_PRODUCTS.map(product => {
                                const isOwned = hasPolicy(product.type);
                                const canAfford = playerState.emergencyFund >= product.annualPremium;
                                return (
                                    <div key={product.type} className={`p-4 rounded-lg flex items-center justify-between ${isOwned ? 'bg-green-500/20 border border-green-500' : 'bg-gray-800/50'}`}>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{product.name} ({product.type})</h4>
                                            <p className="text-sm text-gray-400">{product.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                <p className="text-sm"><span className="font-semibold text-red-400">Premium:</span> {formatCurrency(product.annualPremium)}/yr</p>
                                                <p className="text-sm"><span className="font-semibold text-green-400">Coverage:</span> {formatCurrency(product.coverageAmount)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            text={isOwned ? 'Active' : 'Buy'}
                                            onClick={() => onBuy(product)}
                                            disabled={isOwned || !canAfford}
                                            className={isOwned ? '!bg-green-700' : ''}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button text="Done" onClick={onClose} className="w-full sm:w-auto" />
                </div>
            </Card>
        </div>
    );
};

export default InsuranceScreen;
