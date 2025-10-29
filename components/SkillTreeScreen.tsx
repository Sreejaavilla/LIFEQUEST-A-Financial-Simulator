import React, { useState } from 'react';
import type { PlayerState, SkillName, Skill } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { SKILL_TREE_DATA } from '../constants';

interface SkillTreeScreenProps {
    playerState: PlayerState;
    onActivate: (skillId: SkillName) => void;
    onClose: () => void;
}

const SkillNode: React.FC<{
    skill: Skill;
    status: 'locked' | 'available' | 'unlocked';
    onSelect: () => void;
    isSelected: boolean;
}> = ({ skill, status, onSelect, isSelected }) => {
    
    const baseClasses = "w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center p-2 text-center border-4 cursor-pointer transition-all duration-300";
    const statusClasses = {
        locked: 'bg-gray-800 border-gray-600 text-gray-500',
        available: 'bg-cyan-900 border-cyan-400 text-cyan-200 animate-pulse',
        unlocked: 'bg-green-700 border-green-400 text-white'
    };
    const selectedClasses = isSelected ? 'ring-4 ring-yellow-400' : '';

    return (
        <div className={`${baseClasses} ${statusClasses[status]} ${selectedClasses}`} onClick={onSelect}>
            <p className="text-xs sm:text-sm font-bold">{skill.name}</p>
        </div>
    );
};

const SkillDetailPanel: React.FC<{
    skill: Skill;
    status: 'locked' | 'available' | 'unlocked';
    xp: number;
    onActivate: (skillId: SkillName) => void;
}> = ({ skill, status, xp, onActivate }) => {

    return (
        <Card className="bg-gray-900/50 h-full flex flex-col">
            <h3 className="text-2xl font-bold text-cyan-300">{skill.name}</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">Tier {skill.tier} Skill</p>
            <div className="flex-grow">
                <p className="text-gray-300 italic mb-4">"{skill.description}"</p>
                <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="font-semibold text-green-400">Effect:</p>
                    <p className="text-gray-200">{skill.buffDescription}</p>
                </div>
            </div>
            
            {status === 'available' && (
                <div className="mt-6">
                    <Button 
                        text={`Activate for ${skill.activationCost} XP`}
                        onClick={() => onActivate(skill.id)}
                        disabled={xp < skill.activationCost}
                        className="w-full"
                    />
                    {xp < skill.activationCost && <p className="text-xs text-center text-red-400 mt-2">Not enough XP</p>}
                </div>
            )}
            {status === 'unlocked' && (
                <p className="text-center font-bold text-green-400 mt-6 p-3 bg-green-500/10 rounded-lg">ACTIVATED</p>
            )}
            {status === 'locked' && (
                 <p className="text-center font-bold text-gray-500 mt-6 p-3 bg-gray-500/10 rounded-lg">LOCKED</p>
            )}
        </Card>
    );
};


const SkillTreeScreen: React.FC<SkillTreeScreenProps> = ({ playerState, onActivate, onClose }) => {
    const [selectedSkill, setSelectedSkill] = useState<Skill>(SKILL_TREE_DATA[0]);
    
    const tiers = Array.from(new Set(SKILL_TREE_DATA.map(s => s.tier))).sort((a,b) => a - b);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <Card className="max-w-6xl w-full h-[90vh] flex flex-col border-2 border-cyan-500/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-cyan-300">Skill Tree</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>

                <div className="flex-grow grid md:grid-cols-3 gap-6 overflow-y-auto">
                    {/* Left Panel: The Tree */}
                    <div className="md:col-span-2 p-4 bg-black/20 rounded-lg overflow-y-auto relative">
                        {/* Connecting Lines would be complex; for now, we use tiers */}
                        {tiers.map(tier => (
                            <div key={tier} className="mb-10">
                                <h2 className="text-xl font-bold text-gray-400 mb-6 border-b-2 border-gray-700 pb-2">Tier {tier}</h2>
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    {SKILL_TREE_DATA.filter(s => s.tier === tier).map(skill => (
                                        <SkillNode
                                            key={skill.id}
                                            skill={skill}
                                            status={playerState.skills[skill.id].status}
                                            onSelect={() => setSelectedSkill(skill)}
                                            isSelected={selectedSkill.id === skill.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Panel: Details */}
                    <div className="md:col-span-1">
                        {selectedSkill && (
                           <SkillDetailPanel 
                                skill={selectedSkill}
                                status={playerState.skills[selectedSkill.id].status}
                                xp={playerState.xp}
                                onActivate={onActivate}
                           />
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SkillTreeScreen;
