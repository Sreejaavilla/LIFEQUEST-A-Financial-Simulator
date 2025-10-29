import React, { useState, useEffect } from 'react';
import type { PlayerState, PresenterQA, LoggedEvent } from '../types';
import Card from './common/Card';
import Button from './common/Button';

interface PresenterToolsProps {
    playerState: PlayerState;
    onUpdate: (qa: PresenterQA[]) => void;
    onClose: () => void;
}

const EventPlayer: React.FC<{ events: LoggedEvent[] }> = ({ events }) => {
    const [visibleEvents, setVisibleEvents] = useState<LoggedEvent[]>([]);

    useEffect(() => {
        setVisibleEvents([]); // Reset on new events
        // Fix: Replaced Node-specific `NodeJS.Timeout` with the cross-environment `ReturnType<typeof setTimeout>`.
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        events.forEach((event, index) => {
            const timeout = setTimeout(() => {
                setVisibleEvents(prev => [...prev, event]);
            }, index * 1200); // 1.2 second delay between events
            timeouts.push(timeout);
        });
        return () => timeouts.forEach(clearTimeout); // Cleanup on unmount
    }, [events]);

    if (events.length === 0) {
        return <p className="text-center text-gray-400">No relevant events found in the log for this topic.</p>;
    }

    return (
        <div className="space-y-3 p-2 h-full overflow-y-auto">
            {visibleEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-800/50 rounded-lg animate-fade-in">
                    <p className="text-sm text-cyan-300 font-bold">Age {event.age}: {event.title}</p>
                    <p className="text-sm text-gray-300">{event.summary}</p>
                </div>
            ))}
        </div>
    );
};


const PresenterTools: React.FC<PresenterToolsProps> = ({ playerState, onUpdate, onClose }) => {
    const [qaData, setQaData] = useState<PresenterQA[]>(playerState.presenterAssets.qa);
    const [selectedReplay, setSelectedReplay] = useState<LoggedEvent[] | null>(null);
    const [copySuccess, setCopySuccess] = useState('');

    const handleTextChange = (id: number, field: 'question' | 'answer', value: string) => {
        setQaData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleShowMeHow = (tags?: string[]) => {
        if (!tags || tags.length === 0) {
            setSelectedReplay([]);
            return;
        }
        const relevantEvents = playerState.eventLog.filter(event => tags.some(tag => event.tags.includes(tag)));
        setSelectedReplay(relevantEvents);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <Card className="max-w-6xl w-full h-[90vh] flex flex-col border-2 border-indigo-500/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-indigo-300">Astra's Presenter Q&amp;A Helper</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>

                <div className="flex-grow grid md:grid-cols-2 gap-6 overflow-hidden">
                    {/* Left: Q&A List */}
                    <div className="overflow-y-auto pr-2 space-y-4">
                        {qaData.map(item => (
                            <Card key={item.id} className="bg-gray-900/50">
                                <textarea
                                    value={item.question}
                                    onChange={(e) => handleTextChange(item.id, 'question', e.target.value)}
                                    className="w-full bg-transparent text-cyan-300 font-bold text-lg p-1 border-b border-gray-700 focus:border-cyan-400 focus:outline-none"
                                    rows={2}
                                />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => handleTextChange(item.id, 'answer', e.target.value)}
                                    className="w-full bg-transparent text-gray-300 p-1 mt-2 h-24 resize-none focus:outline-none focus:bg-gray-800/50 rounded"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    {item.relatedLogTags && (
                                        <Button
                                            text="Show Me How"
                                            onClick={() => handleShowMeHow(item.relatedLogTags)}
                                            className="text-xs !py-1 !px-2 !bg-yellow-600 hover:!bg-yellow-500"
                                        />
                                    )}
                                    <Button
                                        text={copySuccess || "Copy Answer"}
                                        onClick={() => handleCopyToClipboard(item.answer)}
                                        className={`text-xs !py-1 !px-2 ${copySuccess ? '!bg-green-600' : ''}`}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Right: Replay Panel */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-yellow-300 mb-2">Simulation Replay</h2>
                        <Card className="flex-grow bg-black/30">
                            {selectedReplay ? (
                                <EventPlayer events={selectedReplay} />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">Click a "Show Me How" button to see a replay.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button text="Save Changes" onClick={() => onUpdate(qaData)} />
                </div>
            </Card>
        </div>
    );
};

export default PresenterTools;