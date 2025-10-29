import type { Skill, LifeEvent, Achievement, LifeStage, PresenterQA } from './types';
// Fix: Imported `ImpactType` enum to resolve type errors.
import { PlayerState, ImpactType } from './types';

// Onboarding
export const AVATAR_OPTIONS = ['avatar1', 'avatar2', 'avatar3'];
export const CAREER_OPTIONS = ['Software Engineer', 'Doctor', 'Teacher', 'Graphic Designer', 'Marketing Manager'];

// Player Progression
export const XP_PER_LEVEL = 1000;
export const INITIAL_AGE = 22;

// Event Generation
export const SURVIVAL_EVENT_CHANCE = 0.25; // 25% chance of a survival event each year

// Tax Minigame
export const TAX_RATE = 0.15; // Simplified flat tax rate
export const DEDUCTIBLE_ITEMS = [
    { name: 'Professional Development Course', amount: 20000, deductible: true },
    { name: 'New Work Laptop', amount: 80000, deductible: true },
    { name: 'Home Office Setup', amount: 50000, deductible: true },
    { name: 'Client Dinners', amount: 15000, deductible: true },
    { name: 'Vacation to Goa', amount: 75000, deductible: false },
    { name: 'Luxury Watch', amount: 120000, deductible: false },
    { name: 'Grocery Shopping', amount: 60000, deductible: false },
    { name: 'Netflix Subscription', amount: 2400, deductible: false },
];

// Insurance
export const INSURANCE_PRODUCTS = [
    { type: 'Health' as const, name: 'MediShield Plus', description: 'Covers major medical emergencies and hospitalization.', coverageAmount: 500000, annualPremium: 10000 },
    { type: 'Vehicle' as const, name: 'AutoGuard', description: 'Protects your vehicle against damage and theft.', coverageAmount: 800000, annualPremium: 15000 },
    { type: 'Property' as const, name: 'HomeSecure', description: 'Insures your home and belongings against unforeseen events.', coverageAmount: 5000000, annualPremium: 8000 },
];

export const CAREER_RISK_FACTORS: Record<string, number> = {
    'Software Engineer': 30,
    'Doctor': 10,
    'Teacher': 15,
    'Graphic Designer': 40,
    'Marketing Manager': 35,
};

// Skill Tree
export const SKILL_TREE_DATA: Skill[] = [
    // Tier 1
    { id: 'emergencyShield', name: 'Emergency Shield', description: 'Strengthen your financial foundation against unexpected shocks.', tier: 1, activationCost: 500, buffDescription: 'Reduces the cost of all survival events by 10%.', prerequisite: () => true },
    { id: 'deductionDetective', name: 'Deduction Detective', description: 'Become savvy at identifying tax-saving opportunities.', tier: 1, activationCost: 500, buffDescription: 'Increases money saved during the tax minigame by 15%.', prerequisite: () => true },
    // Tier 2
    { id: 'diversificationPro', name: 'Diversification Pro', description: 'Learn to spread your investments to mitigate risk.', tier: 2, activationCost: 1000, buffDescription: 'Reduces asset volatility during crises by 5%. Unlocks new investment options.', prerequisite: (playerState: PlayerState) => playerState.skills.emergencyShield.status === 'unlocked' },
    { id: 'insuranceGuardian', name: 'Insurance Guardian', description: 'Master the art of using insurance to protect your wealth.', tier: 2, activationCost: 1000, buffDescription: 'Reduces all insurance premiums by 10%.', prerequisite: (playerState: PlayerState) => playerState.skills.emergencyShield.status === 'unlocked' },
    // Tier 3
    { id: 'wealthWarrior', name: 'Wealth Warrior', description: 'Aggressively grow your net worth through strategic financial moves.', tier: 3, activationCost: 2000, buffDescription: 'Grants a 5% bonus to all one-time financial gains and investment returns.', prerequisite: (playerState: PlayerState) => !!(playerState.skills.diversificationPro.status === 'unlocked' && playerState.skills.insuranceGuardian.status === 'unlocked') },
];

// Crisis
export const CRISIS_REWARDS: { victoryXp: number, badge: Omit<Achievement, 'timestamp'> } = {
    victoryXp: 1500,
    badge: {
        name: 'Recession Survivor',
        description: 'You successfully navigated a major economic crisis.',
        type: 'badge'
    }
};

// Life Stages
export const LIFE_STAGES: Record<LifeStage, {
    ageRange: [number, number],
    bonus?: { cash: number, xp: number },
    promotion?: (currentCareer: string) => string,
    crisisChance?: number
}> = {
    'Early Career': { ageRange: [22, 34], crisisChance: 0.1 },
    'Mid-Career': {
        ageRange: [35, 49],
        bonus: { cash: 200000, xp: 1000 },
        promotion: (currentCareer) => `Senior ${currentCareer}`,
        crisisChance: 0.2
    },
    'Late Career': {
        ageRange: [50, 64],
        bonus: { cash: 500000, xp: 2000 },
        promotion: (currentCareer) => `Principal ${currentCareer}`,
        crisisChance: 0.1
    },
    'Retirement': { ageRange: [65, 100] }
};

export const MID_CAREER_TRANSITION_EVENT: LifeEvent = {
    title: "The Mid-Career Crossroads",
    description: "You've reached a pivotal point in your career and life. The path you've been on has served you well, but now new opportunities and responsibilities emerge. Do you double down on your current path for stability, or take a risk for potentially greater rewards and fulfillment?",
    type: 'CHOICE',
    isSurvival: false,
    choices: [
        {
            text: "Focus on Career Stability",
            outcome: "You decide to deepen your expertise in your current role, becoming an indispensable part of your team. This brings a secure salary increase and lower stress.",
            // Fix: Replaced string literal with ImpactType enum member.
            impact: { type: ImpactType.INCOME_CHANGE, amount: 150000, description: "Received a promotion and a ₹1,50,000 yearly salary increase." }
        },
        {
            text: "Start a Side Business",
            outcome: "You take a risk and invest your time and some capital into a side hustle you're passionate about. It's a significant upfront cost and adds stress, but the potential upside is huge.",
            // Fix: Replaced string literal with ImpactType enum member.
            impact: { type: ImpactType.ONE_TIME_COST, amount: -250000, description: "Invested ₹2,50,000 as seed money for your new side business." }
        }
    ]
};

// Presenter Q&A Helper
export const PRESENTER_QA_TEMPLATE: PresenterQA[] = [
    { id: 1, question: "What's the core concept of LifeQuest?", answer: "LifeQuest is a gamified financial life simulator. It uses AI-generated scenarios to teach financial literacy by letting players experience the long-term consequences of their financial decisions in a safe, engaging environment." },
    { id: 2, question: "How does the AI (Gemini) enhance the experience?", answer: "Gemini generates dynamic, context-aware life events. Instead of static, pre-written scenarios, the AI tailors events to the player's age, career, and financial situation, ensuring a unique and realistic playthrough every time." },
    { id: 3, question: "What is the primary goal for the player?", answer: "The goal is to successfully navigate 40+ years of simulated life, grow their net worth, and achieve financial goals while managing unexpected events. The ultimate 'win' is reaching a financially secure retirement." },
    { id: 4, question: "Can you explain the Skill Tree?", answer: "The Skill Tree allows players to spend XP, earned by making good decisions, to unlock powerful financial buffs. For example, 'Deduction Detective' makes you better at saving money during the tax minigame, directly rewarding your progress with tangible benefits.", relatedLogTags: ['skill_unlock', 'tax_minigame'] },
    { id: 5, question: "How do you handle unexpected negative events?", answer: "We have 'Survival Events'—sudden, costly emergencies. Players must choose how to pay for them: using their emergency fund, selling assets, or taking a loan. This teaches the importance of having a financial safety net.", relatedLogTags: ['survival'] },
    { id: 6, question: "What is the 'Crisis' module?", answer: "Crises are multi-month economic downturns, like a recession. The player's income is reduced and asset values fall. They must survive a set number of months without going bankrupt. It's a high-stakes test of financial resilience.", relatedLogTags: ['crisis'] },
    { id: 7, question: "How does the game teach about insurance?", answer: "The Insurance Marketplace calculates the player's 'Risk Exposure' based on their career and assets. It then recommends policies like health or vehicle insurance. Buying insurance reduces their risk score and protects them from specific survival events.", relatedLogTags: ['insurance'] },
    { id: 8, question: "What is the educational value here?", answer: "The core loop—'Decision -> Consequence -> Learning'—is the educational driver. By seeing a choice from age 25 directly impact their retirement at age 65, players internalize long-term financial principles in a way that reading about them can't replicate." },
    { id: 9, question: "Who is the target audience?", answer: "Primarily young adults and students (ages 16-25) who are beginning their financial journey. The gamified approach makes learning about complex topics like investing, taxes, and insurance accessible and non-intimidating." },
    { id: 10, question: "What's the tech stack?", answer: "It's a pure frontend prototype built with React, TypeScript, and TailwindCSS. It uses Chart.js for data visualization and the Google Gemini API for dynamic event generation. All state is managed locally and is browser-runnable." },
    { id: 11, question: "How are you ensuring the AI's output is structured and safe?", answer: "We use Gemini's JSON mode with a strict schema definition. This forces the AI to return data in a predictable format that the game can parse. We also provide strong system prompts to guide the AI's creativity within safe, financially-relevant boundaries." },
    { id: 12, question: "What are the next steps for this project?", answer: "The next steps would be to build out the investment module with a simulated stock market, add more life stage transitions with deeper choices (marriage, children), and introduce multiplayer features where players can see how their financial journey compares to their friends." }
];