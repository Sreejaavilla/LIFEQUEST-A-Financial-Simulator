// Fix: Removed a self-referential import of `ImpactType` that was causing a conflict with its own declaration below.
export enum ImpactType {
  INCOME_CHANGE = 'INCOME_CHANGE',
  EXPENSE_CHANGE = 'EXPENSE_CHANGE',
  ASSET_CHANGE = 'ASSET_CHANGE',
  LIABILITY_CHANGE = 'LIABILITY_CHANGE',
  NET_WORTH_CHANGE = 'NET_WORTH_CHANGE',
  CREDIT_SCORE_CHANGE = 'CREDIT_SCORE_CHANGE',
  HAPPINESS_CHANGE = 'HAPPINESS_CHANGE',
  ONE_TIME_COST = 'ONE_TIME_COST',
  ONE_TIME_GAIN = 'ONE_TIME_GAIN',
}

export interface FinancialImpact {
  type: ImpactType;
  amount: number;
  description: string;
}

export interface PlayerChoice {
  text: string;
  outcome: string;
  impact: FinancialImpact | null;
}

export type EventCategory = 'medical' | 'vehicle' | 'property' | 'general';

export interface LifeEvent {
  title: string;
  description: string;
  type: 'CHOICE' | 'CONSEQUENCE';
  isSurvival: boolean;
  cost?: number;
  category?: EventCategory;
  impact?: FinancialImpact | null;
  choices?: PlayerChoice[] | null;
}

export interface Financials {
  income: number; // Yearly
  expenses: number; // Yearly
  assets: number;
  liabilities: number;
  recurringExpenses: { description: string; amount: number }[]; // For mortgage, childcare etc.
}

export interface Career {
  name: string;
  salary: number; // Yearly
}

export type PortfolioItemType = 'Stock' | 'Bond' | 'Real Estate' | 'Commodity' | 'Initial';

export interface PortfolioItem {
    name: string;
    value: number;
    type: PortfolioItemType;
}

export interface InsurancePolicy {
    type: 'Health' | 'Vehicle' | 'Property';
    coverageAmount: number;
    annualPremium: number;
    activeUntilAge: number;
}

export interface Achievement {
    name: string;
    description: string;
    timestamp: string;
    type: 'achievement' | 'badge';
}

// -- Skill Tree Types --
export type SkillName = 'emergencyShield' | 'deductionDetective' | 'diversificationPro' | 'insuranceGuardian' | 'wealthWarrior';

export type SkillStatusType = 'locked' | 'available' | 'unlocked';

export interface SkillStatus {
    status: SkillStatusType;
    unlockedAt: string | null;
}

export interface Skill {
    id: SkillName;
    name: string;
    description: string;
    tier: number;
    activationCost: number; // XP cost
    buffDescription: string;
    prerequisite: (playerState: PlayerState) => boolean;
}
// -- End Skill Tree Types --

// -- Crisis Types --
export interface CrisisState {
    name: string;
    description: string;
    duration: number; // in months
    currentMonth: number;
    effects: {
        incomeReduction: number; // e.g., 0.2 for 20%
        expenseIncrease: number; // e.g., 0.1 for 10%
        assetVolatility: number; // e.g., -0.15 for -15%
    };
    survivalThreshold: number; // Net worth must stay above this
    victoryThreshold: number; // End with net worth above this for a better reward
    log: { month: number, entry: string }[];
}
// -- End Crisis Types --

// -- Life Stage Types --
export type LifeStage = 'Early Career' | 'Mid-Career' | 'Late Career' | 'Retirement';
// -- End Life Stage Types --

// -- Event Logging & Presenter Tools --
export interface LoggedEvent {
    id: string;
    timestamp: string;
    age: number;
    title: string;
    summary: string;
    tags: string[];
}

export interface PresenterQA {
    id: number;
    question: string;
    answer: string;
    relatedLogTags?: string[];
}
// -- End Event Logging & Presenter Tools --


export interface PlayerState {
  name: string;
  age: number;
  level: number;
  xp: number;
  career: Career;
  financials: Financials;
  emergencyFund: number;
  portfolio: PortfolioItem[];
  happiness: number; // Percentage
  creditScore: number; // 300-850
  history: { age: number, netWorth: number }[];
  insurance: InsurancePolicy[];
  skills: Record<SkillName, SkillStatus>;
  achievements: Achievement[];
  crisis: CrisisState | null;
  stage: LifeStage;
  eventLog: LoggedEvent[];
  presenterAssets: {
      qa: PresenterQA[];
  };
}

export interface PlayerProfile {
    name: string;
    avatar: string;
    career: string;
    monthlySalary: number;
}