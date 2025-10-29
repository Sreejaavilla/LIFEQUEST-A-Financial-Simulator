
import React from 'react';
import Card from './common/Card';
import PieChart from './common/PieChart';
import Button from './common/Button';
import { formatCurrency } from '../utils/formatters';

// This is a placeholder component as the budgeting phase is not yet implemented in the main game loop.
// It demonstrates how such a screen could look.

interface BudgetingScreenProps {
    yearlyIncome: number;
    yearlyExpenses: number;
    onBudgetConfirm: () => void;
}

const BudgetingScreen: React.FC<BudgetingScreenProps> = ({ yearlyIncome, yearlyExpenses, onBudgetConfirm }) => {
    // Dummy expense breakdown for visualization
    const savings = yearlyIncome > yearlyExpenses ? yearlyIncome - yearlyExpenses : 0;
    const expenseData = {
        labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings'],
        values: [
            yearlyExpenses * 0.4, 
            yearlyExpenses * 0.2, 
            yearlyExpenses * 0.15,
            yearlyExpenses * 0.1,
            savings
        ],
        colors: ['#06b6d4', '#6366f1', '#ec4899', '#f97316', '#22c55e'] // cyan, indigo, pink, orange, green
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-center mb-4 text-cyan-300">Annual Budget Review</h1>
                <p className="text-center text-gray-400 mb-6">Review your income and expenses for the upcoming year.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <p className="text-sm text-gray-400">Total Yearly Income</p>
                                <p className="text-2xl font-bold text-green-400">{formatCurrency(yearlyIncome)}</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <p className="text-sm text-gray-400">Total Yearly Expenses</p>
                                <p className="text-2xl font-bold text-red-400">{formatCurrency(yearlyExpenses)}</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <p className="text-sm text-gray-400">Projected Yearly Savings</p>
                                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(savings)}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <PieChart data={expenseData} title="Income Allocation" />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    {/* In a full implementation, there would be sliders or inputs to adjust budget categories */}
                    <p className="text-gray-400 mb-4 italic">Budget adjustment controls would go here.</p>
                    <Button text="Confirm Budget & Continue" onClick={onBudgetConfirm} className="w-full sm:w-auto" />
                </div>
            </Card>
        </div>
    );
};

export default BudgetingScreen;
