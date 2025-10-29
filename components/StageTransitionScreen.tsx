import React from 'react';
import type { PlayerState, LifeStage, PlayerChoice } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { LIFE_STAGES, MID_CAREER_TRANSITION_EVENT } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface StageTransitionScreenProps {
    playerState: PlayerState;
    nextStage: LifeStage;
    onChoice: (choice: PlayerChoice) => void;
}

const LifePath: React.FC<{ currentStage: LifeStage }> = ({ currentStage }) => {
    const stages: LifeStage[] = ['Early Career', 'Mid-Career', 'Late Career', 'Retirement'];
    const currentIndex = stages.indexOf(currentStage);

    return (
        <div className="w-full flex justify-center items-center my-8">
            {stages.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                
                let stageClasses = "w-24 h-24 rounded-full flex items-center justify-center p-2 text-center border-4 ";
                if(isCurrent) {
                    stageClasses += "bg-yellow-500/50 border-yellow-300 text-white font-bold animate-pulse";
                } else if(isCompleted) {
                    stageClasses += "bg-cyan-700 border-cyan-500 text-cyan-200";
                } else {
                    stageClasses += "bg-gray-800 border-gray-600 text-gray-500";
                }

                return (
                    <React.Fragment key={stage}>
                        <div className={stageClasses}>
                            <span className="text-sm">{stage}</span>
                        </div>
                        {index < stages.length - 1 && <div className="w-16 h-1 bg-gray-600"></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


const StageTransitionScreen: React.FC<StageTransitionScreenProps> = ({ playerState, nextStage, onChoice }) => {
    
    const stageInfo = LIFE_STAGES[playerState.stage];
    const event = nextStage === 'Mid-Career' ? MID_CAREER_TRANSITION_EVENT : null;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 animate-fade-in">
             <div className="stars"></div>
             <div className="twinkling"></div>
            <Card className="max-w-3xl w-full border-2 border-yellow-400/50 bg-black/50">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-yellow-300 mb-4">A New Chapter Begins!</h1>
                    <p className="text-xl text-gray-300">You have entered your: <span className="font-bold text-white">{nextStage}</span></p>
                </div>
                
                <LifePath currentStage={nextStage} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center my-8">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-gray-400">Stage Completion Bonus</p>
                        <p className="text-2xl font-bold text-green-400">
                           {stageInfo.bonus ? `${formatCurrency(stageInfo.bonus.cash)} + ${stageInfo.bonus.xp} XP` : 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-gray-400">Career Promotion</p>
                         <p className="text-2xl font-bold text-cyan-400">
                           {stageInfo.promotion ? stageInfo.promotion(playerState.career.name) : 'Salary Review'}
                        </p>
                    </div>
                </div>

                {event && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-300">{event.title}</h2>
                        <p className="text-center text-gray-400 mb-6">{event.description}</p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            {event.choices?.map((choice, index) => (
                                <Button
                                    key={index}
                                    text={choice.text}
                                    onClick={() => onChoice(choice)}
                                    className="flex-1"
                                />
                            ))}
                        </div>
                    </div>
                )}
                 {!event && (
                    <div className="text-center">
                        <Button
                            text="Continue"
                            onClick={() => onChoice({ text: "Continue", outcome: "Proceed to the next year.", impact: null })}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StageTransitionScreen;