import React, { useState, useEffect } from 'react';
import type { LifeEvent, PlayerChoice, PlayerState } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { formatCurrency } from '../utils/formatters';

interface EventCardProps {
  event: LifeEvent;
  playerState: PlayerState;
  onChoice: (choice: PlayerChoice) => void;
  onResolveSurvival: (method: 'emergency_fund' | 'sell_asset' | 'loan' | 'hardship', cost: number) => void;
}

const CountdownTimer: React.FC<{ onTimeout: () => void }> = ({ onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeout();
            return;
        };

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeout]);

    const progress = (timeLeft / 15) * 100;

    return (
        <div className="w-full my-4">
            <p className="text-center text-sm text-gray-400 mb-1">Time to decide...</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}

const EventCard: React.FC<EventCardProps> = ({ event, playerState, onChoice, onResolveSurvival }) => {

  const handleConsequence = () => {
      // This is for standard, non-survival consequence events
      // The impact description from the event itself serves as the outcome message.
      onChoice({
        text: 'Acknowledge',
        outcome: event.description,
        impact: event.impact || null
      });
  }

  // Render Survival Event UI
  if (event.isSurvival && event.cost) {
    const { cost } = event;
    const canPayFromEmergency = playerState.emergencyFund >= cost;
    const canSellAssets = playerState.financials.assets >= cost;
    const mustTakeHardship = !canPayFromEmergency && !canSellAssets;

    return (
        <Card className="border-2 border-red-500/50 shadow-red-500/20">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-2 text-red-400">ALERT: {event.title}</h2>
                    {event.category && <span className="text-xs bg-red-500/50 text-white font-bold uppercase px-2 py-1 rounded">{event.category}</span>}
                </div>
                <p className="text-gray-300 mb-4 flex-grow">{event.description}</p>

                <div className="my-4 p-4 bg-gray-800/50 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Unexpected Cost</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(cost)}</p>
                </div>

                <CountdownTimer onTimeout={() => onResolveSurvival('hardship', cost)} />
                
                <p className="text-center text-gray-400 mb-4">How will you handle this?</p>
                
                <div className="flex flex-col gap-3">
                    <Button 
                      text={`Pay with Emergency Fund (${formatCurrency(playerState.emergencyFund)})`} 
                      onClick={() => onResolveSurvival('emergency_fund', cost)}
                      disabled={!canPayFromEmergency}
                      className="w-full !bg-green-600 hover:!bg-green-500 disabled:!bg-gray-600"
                    />
                     <Button 
                      text="Sell Assets" 
                      onClick={() => onResolveSurvival('sell_asset', cost)}
                      disabled={!canSellAssets}
                      className="w-full !bg-yellow-600 hover:!bg-yellow-500 disabled:!bg-gray-600"
                    />
                     <Button 
                      text="Take a Loan" 
                      onClick={() => onResolveSurvival('loan', cost)}
                      disabled={mustTakeHardship}
                      className="w-full !bg-orange-600 hover:!bg-orange-500 disabled:!bg-gray-600"
                    />
                    {mustTakeHardship && (
                         <Button 
                            text="Face Hardship" 
                            onClick={() => onResolveSurvival('hardship', cost)}
                            className="w-full !bg-red-800 hover:!bg-red-700 animate-pulse"
                        />
                    )}
                </div>
            </div>
        </Card>
    );
  }

  // Render Standard Event UI
  return (
    <Card>
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-2 text-cyan-300">{event.title}</h2>
        <p className="text-gray-300 mb-6 flex-grow">{event.description}</p>
        
        {event.type === 'CONSEQUENCE' && event.impact && (
            <div className="mb-6 p-3 bg-gray-800/50 rounded-lg">
                <p className="font-semibold text-yellow-400">Financial Impact</p>
                <p className="text-gray-200">{event.impact.description}</p>
            </div>
        )}
        
        <div className="flex flex-col gap-3">
          {event.type === 'CHOICE' && event.choices?.map((choice, index) => (
            <Button 
              key={index} 
              onClick={() => onChoice(choice)} 
              text={choice.text} 
              className="w-full text-center"
            />
          ))}
           {event.type === 'CONSEQUENCE' && (
             <Button 
              onClick={handleConsequence} 
              text="Continue" 
              className="w-full text-center"
            />
           )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;