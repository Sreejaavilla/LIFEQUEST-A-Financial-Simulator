import React, { useState, useEffect } from 'react';
import type { CrisisState } from '../types';
import Card from './common/Card';
import Button from './common/Button';

interface CrisisIntroScreenProps {
    crisis: CrisisState;
    onStart: () => void;
}

const Typewriter: React.FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (displayedText.length < text.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, 30); // Adjust speed here
            return () => clearTimeout(timeoutId);
        } else {
            onComplete();
        }
    }, [displayedText, text, onComplete]);

    return <p className="text-lg text-gray-300 leading-relaxed">{displayedText}<span className="animate-ping">▌</span></p>;
};

const CrisisIntroScreen: React.FC<CrisisIntroScreenProps> = ({ crisis, onStart }) => {
    const [isTyping, setIsTyping] = useState(true);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 animate-fade-in">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <Card className="max-w-3xl w-full border-2 border-red-500/50 bg-black/50">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-red-400 mb-4 animate-pulse">CRISIS ALERT</h1>
                    <h2 className="text-3xl font-semibold text-white mb-8">{crisis.name}</h2>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg min-h-[150px]">
                    <h3 className="text-xl font-bold text-yellow-300 mb-2">Astra's Briefing</h3>
                    <Typewriter text={crisis.description} onComplete={() => setIsTyping(false)} />
                </div>
                
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-center text-cyan-300 mb-4">Your Mission: Survive</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-red-900/30 rounded-lg">
                            <p className="font-bold text-red-400">Condition for Failure</p>
                            <p className="text-gray-300">Emergency Fund hits ₹0 OR Net Worth drops below {crisis.survivalThreshold.toLocaleString('en-IN')}.</p>
                        </div>
                         <div className="p-3 bg-green-900/30 rounded-lg">
                            <p className="font-bold text-green-400">Condition for Victory</p>
                            <p className="text-gray-300">Survive all {crisis.duration} months and maintain your financial stability.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Button 
                        text="Begin the Challenge" 
                        onClick={onStart} 
                        disabled={isTyping}
                        className="w-full sm:w-auto !py-4 !px-8 text-lg"
                    />
                </div>
            </Card>
        </div>
    );
};

export default CrisisIntroScreen;
