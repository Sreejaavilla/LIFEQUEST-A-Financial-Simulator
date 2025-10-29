import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import EventCard from './components/EventCard';
import NetWorthChart from './components/NetWorthChart';
import Portfolio from './components/Portfolio';
import Loader from './components/common/Loader';
import Button from './components/common/Button';
import InsuranceScreen from './components/InsuranceScreen';
import SkillTreeScreen from './components/SkillTreeScreen';
import TaxMinigameScreen from './components/TaxMinigameScreen';
import CrisisHUD from './components/CrisisHUD';
import CrisisIntroScreen from './components/CrisisIntroScreen';
import CrisisResultScreen from './components/CrisisResultScreen';
import StageTransitionScreen from './components/StageTransitionScreen';
import AchievementModal from './components/AchievementModal';
import PresenterTools from './components/PresenterTools';


import { useGameState } from './hooks/useGameState';
import { getLifeEvent, getCrisisEvent } from './services/geminiService';
import type { PlayerProfile, Achievement } from './types';

const App: React.FC = () => {
    const {
        playerState,
        currentEvent,
        gamePhase,
        activeModal,
        startGame,
        loadGame,
        setEvent,
        resolveChoice,
        resolveSurvival,
        advanceYear,
        openModal,
        buyInsurance,
        activateSkill,
        completeTaxMinigame,
        triggerCrisis,
        advanceCrisisMonth,
        endCrisis,
        rollbackCrisisMonth,
        updatePresenterAssets
    } = useGameState();

    const [isLoading, setIsLoading] = useState(false);
    const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);

    // Effect to check for new achievements
    useEffect(() => {
        if (playerState && playerState.achievements.length > 0) {
            const latestAchievement = playerState.achievements[playerState.achievements.length - 1];
            // A simple check to see if it's a new one we haven't shown
            if (latestAchievement.timestamp !== lastAchievement?.timestamp) {
                setLastAchievement(latestAchievement);
            }
        }
    }, [playerState?.achievements, lastAchievement]);


    const handleNextYear = async () => {
        if (!playerState) return;
        setIsLoading(true);
        // advanceYear might change the gamePhase to 'stage_transition' or 'tax_minigame'
        const newGamePhase = await advanceYear();
        
        // Only fetch a new event if we are in a standard turn
        if (newGamePhase === 'turn_end') {
            const event = await getLifeEvent(playerState);
            setEvent(event);
        }
        setIsLoading(false);
    };
    
    const handleNextCrisisMonth = async () => {
        if (!playerState || !playerState.crisis) return;
        setIsLoading(true);
        const newGamePhase = await advanceCrisisMonth();
        
        // After advancing, if the game is still in 'turn_end' (meaning no win/loss), get a new crisis event.
        if (newGamePhase === 'turn_end') {
            const event = await getCrisisEvent(playerState, playerState.crisis);
            setEvent(event);
        }
        setIsLoading(false);
    };

    const handleOnboardingComplete = async (profile: PlayerProfile) => {
        await startGame(profile);
    };
    
    useEffect(() => {
      // After starting game, trigger first event
      if (gamePhase === 'turn_end' && playerState && playerState.age === 22 && !currentEvent) {
          handleNextYear();
      }
    }, [gamePhase, playerState, currentEvent]);
    
    const handleExport = () => {
        if(!playerState) return;
        const json = JSON.stringify(playerState, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifequest-save-${playerState.name.toLowerCase()}-${playerState.age}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!playerState) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }
    
    if (playerState.crisis && gamePhase === 'crisis' && playerState.crisis.currentMonth === 0) {
       return <CrisisIntroScreen crisis={playerState.crisis} onStart={handleNextCrisisMonth} />;
    }
    
    if (gamePhase === 'crisis_won') {
        return <CrisisResultScreen result="won" onContinue={() => endCrisis('won')} onRollback={() => {}} />;
    }
    if (gamePhase === 'crisis_lost') {
        return <CrisisResultScreen result="lost" onRollback={rollbackCrisisMonth} onContinue={() => {}} />;
    }

    if (gamePhase === 'stage_transition' && playerState.stage) {
        return <StageTransitionScreen playerState={playerState} nextStage={playerState.stage} onChoice={(choice) => resolveChoice(choice, "Stage Transition Choice")} />;
    }
    
    if (gamePhase === 'tax_minigame') {
        return <TaxMinigameScreen playerState={playerState} onComplete={completeTaxMinigame} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white font-sans p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {playerState.crisis ? (
                    <CrisisHUD playerState={playerState} crisis={playerState.crisis} />
                ) : (
                    <Dashboard
                        playerState={playerState}
                        onManageInsurance={() => openModal('insurance')}
                        onOpenSkillTree={() => openModal('skillTree')}
                        onOpenPresenterTools={() => openModal('presenterTools')}
                        onExport={handleExport}
                        onImport={loadGame}
                    />
                )}
                <main className="mt-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        {isLoading ? (
                            <Loader />
                        ) : currentEvent ? (
                            <EventCard
                                event={currentEvent}
                                playerState={playerState}
                                onChoice={(choice) => resolveChoice(choice, currentEvent.title)}
                                onResolveSurvival={(method, cost) => resolveSurvival(method, cost, currentEvent.title)}
                            />
                        ) : (
                            <div className="text-center">
                                <Button
                                    text={playerState.crisis ? "Advance to Next Month" : "Advance to Next Year"}
                                    onClick={playerState.crisis ? handleNextCrisisMonth : handleNextYear}
                                    className="!py-4 !px-8 text-lg"
                                />
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1 space-y-8">
                        <NetWorthChart history={playerState.history} />
                        <Portfolio portfolio={playerState.portfolio} />
                    </div>
                </main>
            </div>
            
            {activeModal === 'insurance' && (
                <InsuranceScreen 
                    playerState={playerState} 
                    onClose={() => openModal(null)} 
                    onBuy={buyInsurance}
                />
            )}
             {activeModal === 'skillTree' && (
                <SkillTreeScreen 
                    playerState={playerState} 
                    onClose={() => openModal(null)} 
                    onActivate={activateSkill}
                />
            )}
            {activeModal === 'presenterTools' && (
                <PresenterTools
                    playerState={playerState}
                    onClose={() => openModal(null)}
                    onUpdate={updatePresenterAssets}
                />
            )}
            {lastAchievement && (
                <AchievementModal achievement={lastAchievement} onClose={() => setLastAchievement(null)} />
            )}
        </div>
    );
};

export default App;