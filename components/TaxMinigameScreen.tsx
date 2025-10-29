import React, { useState } from 'react';
import type { PlayerState, Achievement } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { DEDUCTIBLE_ITEMS, TAX_RATE } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface TaxMinigameScreenProps {
    playerState: PlayerState;
    onComplete: (deductions: number, taxSaved: number) => void;
}

// Fix: Changed interface to a type alias to correctly create a new type
// by intersecting the inferred type of DEDUCTIBLE_ITEMS with a new 'id' property.
type DraggableItem = (typeof DEDUCTIBLE_ITEMS)[0] & {
    id: number;
};

const TaxMinigameScreen: React.FC<TaxMinigameScreenProps> = ({ playerState, onComplete }) => {
    const [availableItems, setAvailableItems] = useState<DraggableItem[]>(() => DEDUCTIBLE_ITEMS.map((item, index) => ({ ...item, id: index })));
    const [deductedItems, setDeductedItems] = useState<DraggableItem[]>([]);
    const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);

    const grossIncome = playerState.financials.income;
    const totalDeductions = deductedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxableIncome = grossIncome - totalDeductions;
    const taxOwed = Math.round(taxableIncome * TAX_RATE);
    const baselineTax = Math.round(grossIncome * TAX_RATE);
    const taxSaved = baselineTax - taxOwed;

    const handleDragStart = (item: DraggableItem) => {
        setDraggedItem(item);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedItem) {
            setDeductedItems(prev => [...prev, draggedItem]);
            setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
            setDraggedItem(null);
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };
    
    const getAstraHint = () => {
        const validDeductionsCount = deductedItems.filter(item => item.deductible).length;
        if (validDeductionsCount === 0) return "Look for expenses directly related to your job or career growth.";
        if (validDeductionsCount < 2) return "You're on the right track! Are there any other professional expenses?";
        if (validDeductionsCount < 4) return "Excellent! Just a couple more valid deductions to find.";
        return "You've found all the valid deductions! Great job maximizing your savings.";
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full">
                <h1 className="text-3xl font-bold text-center mb-2 text-cyan-300">Tax Season is Here!</h1>
                <p className="text-center text-gray-400 mb-6">Drag and drop valid deductions to lower your taxable income.</p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Calculation */}
                    <div className="md:col-span-1 space-y-4">
                        <Card className="bg-gray-900/50">
                            <h3 className="text-lg font-bold text-center mb-2">Live Tax Calculation</h3>
                            <div className="space-y-3">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">Gross Income</p>
                                    <p className="text-xl font-bold">{formatCurrency(grossIncome)}</p>
                                </div>
                                 <div className="text-center">
                                    <p className="text-sm text-gray-400">Total Deductions</p>
                                    <p className="text-xl font-bold text-yellow-400">{formatCurrency(totalDeductions)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">Tax Owed</p>
                                    <p className="text-xl font-bold text-red-400">{formatCurrency(taxOwed)}</p>
                                </div>
                                <div className="text-center p-2 bg-green-900/50 rounded-lg">
                                    <p className="text-sm text-gray-300">Total Tax Saved!</p>
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(taxSaved)}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gray-900/50">
                             <h3 className="text-lg font-bold text-yellow-300 mb-2">Astra's Hint</h3>
                             <p className="text-sm text-gray-300 italic">"{getAstraHint()}"</p>
                        </Card>
                    </div>

                    {/* Right: Drag and Drop */}
                    <div className="md:col-span-2 grid grid-cols-1 gap-4">
                         <Card className="bg-gray-900/50">
                            <h3 className="text-lg font-bold text-center mb-3">Available Expenses</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {availableItems.map(item => (
                                    <div key={item.id} draggable onDragStart={() => handleDragStart(item)} className="p-3 bg-gray-800 rounded-lg text-center cursor-move hover:bg-gray-700">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-cyan-300">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))}
                                {availableItems.length === 0 && <p className="text-center text-gray-500 col-span-full">No more items.</p>}
                            </div>
                        </Card>

                        <div onDrop={handleDrop} onDragOver={handleDragOver} className="p-4 border-2 border-dashed border-cyan-500 rounded-lg min-h-[200px] bg-cyan-900/20">
                            <h3 className="text-lg font-bold text-center text-cyan-300 mb-3">Drop Deductions Here</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {deductedItems.map(item => (
                                    <div key={item.id} className={`p-3 rounded-lg text-center ${item.deductible ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-white">{formatCurrency(item.amount)}</p>
                                    </div>
                                ))}
                                {deductedItems.length === 0 && <p className="text-center text-gray-500 col-span-full">Drag items to claim them.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button onClick={() => onComplete(totalDeductions, taxSaved)} text="File Taxes & Continue" className="w-full" />
                </div>
            </Card>
        </div>
    );
};

export default TaxMinigameScreen;