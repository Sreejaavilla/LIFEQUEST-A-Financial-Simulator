import { useReducer, useCallback } from 'react';
import type { PlayerState, PlayerProfile, LifeEvent, PlayerChoice, FinancialImpact, SkillName, LifeStage, CrisisState, InsurancePolicy, SkillStatus, PresenterQA, LoggedEvent } from '../types';
import { ImpactType } from '../types';
import { INITIAL_AGE, XP_PER_LEVEL, SKILL_TREE_DATA, LIFE_STAGES, CRISIS_REWARDS, PRESENTER_QA_TEMPLATE } from '../constants';
import { formatCurrency } from '../utils/formatters';

type GamePhase = 'onboarding' | 'event' | 'turn_end' | 'crisis' | 'crisis_won' | 'crisis_lost' | 'stage_transition' | 'tax_minigame';

type GameAction =
  | { type: 'START_GAME'; payload: PlayerProfile }
  | { type: 'SET_EVENT'; payload: LifeEvent }
  | { type: 'RESOLVE_CHOICE'; payload: { choice: PlayerChoice, eventTitle: string } }
  | { type: 'RESOLVE_SURVIVAL'; payload: { method: string, cost: number, eventTitle: string } }
  | { type: 'ADVANCE_YEAR' }
  | { type: 'OPEN_MODAL'; payload: 'insurance' | 'skillTree' | 'presenterTools' | null }
  | { type: 'BUY_INSURANCE'; payload: Omit<InsurancePolicy, 'activeUntilAge'> & { name: string } }
  | { type: 'ACTIVATE_SKILL'; payload: SkillName }
  | { type: 'COMPLETE_TAX_MINIGAME'; payload: { deductions: number; taxSaved: number } }
  | { type: 'TRIGGER_CRISIS'; payload: CrisisState }
  | { type: 'ADVANCE_CRISIS_MONTH' }
  | { type: 'END_CRISIS'; payload: { result: 'won' | 'lost' } }
  | { type: 'ROLLBACK_CRISIS_MONTH' }
  | { type: 'SET_GAME_PHASE', payload: GamePhase }
  | { type: 'SET_PLAYER_STATE'; payload: PlayerState }
  | { type: 'UPDATE_PRESENTER_ASSETS'; payload: PresenterQA[] };


interface GameState {
  playerState: PlayerState | null;
  currentEvent: LifeEvent | null;
  gamePhase: GamePhase;
  activeModal: 'insurance' | 'skillTree' | 'presenterTools' | null;
  crisisHistory: PlayerState[]; // For rollback
}

const initialState: GameState = {
  playerState: null,
  currentEvent: null,
  gamePhase: 'onboarding',
  activeModal: null,
  crisisHistory: [],
};

const getInitialPlayerState = (profile: PlayerProfile): PlayerState => {
    const yearlySalary = profile.monthlySalary * 12;
    const initialSkills: Record<SkillName, SkillStatus> = {
        emergencyShield: { status: 'available', unlockedAt: null },
        deductionDetective: { status: 'available', unlockedAt: null },
        diversificationPro: { status: 'locked', unlockedAt: null },
        insuranceGuardian: { status: 'locked', unlockedAt: null },
        wealthWarrior: { status: 'locked', unlockedAt: null },
    };

    return {
        name: profile.name,
        age: INITIAL_AGE,
        level: 1,
        xp: 0,
        career: { name: profile.career, salary: yearlySalary },
        financials: {
            income: yearlySalary,
            expenses: yearlySalary * 0.7, // 70% of income
            assets: yearlySalary * 0.2, // Initial assets
            liabilities: 0,
            recurringExpenses: [],
        },
        emergencyFund: yearlySalary * 0.25, // 3 months income
        portfolio: [{ name: 'Initial Savings', value: yearlySalary * 0.2, type: 'Initial' }],
        happiness: 75,
        creditScore: 650,
        history: [{ age: INITIAL_AGE, netWorth: yearlySalary * 0.45 }],
        insurance: [],
        skills: initialSkills,
        achievements: [],
        crisis: null,
        stage: 'Early Career',
        eventLog: [],
        presenterAssets: {
            qa: PRESENTER_QA_TEMPLATE,
        }
    };
};

const addLogEntry = (state: PlayerState, title: string, summary: string, tags: string[]): PlayerState => {
    const newLog: LoggedEvent = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        age: state.age,
        title,
        summary,
        tags
    };
    return { ...state, eventLog: [...state.eventLog, newLog] };
};


const applyImpact = (state: PlayerState, impact: FinancialImpact): PlayerState => {
    const newState = JSON.parse(JSON.stringify(state)); // Deep copy to avoid mutation issues
    switch (impact.type) {
        case ImpactType.INCOME_CHANGE:
            newState.financials.income += impact.amount;
            break;
        case ImpactType.EXPENSE_CHANGE:
            newState.financials.expenses += impact.amount;
            break;
        case ImpactType.ASSET_CHANGE:
            newState.financials.assets += impact.amount;
            break;
        case ImpactType.LIABILITY_CHANGE:
            newState.financials.liabilities += impact.amount;
            break;
        case ImpactType.NET_WORTH_CHANGE:
             if (impact.amount > 0) newState.emergencyFund += impact.amount;
             else newState.financials.assets += impact.amount;
            break;
        case ImpactType.ONE_TIME_COST:
            newState.emergencyFund -= Math.abs(impact.amount);
            break;
        case ImpactType.ONE_TIME_GAIN:
            newState.emergencyFund += Math.abs(impact.amount);
            break;
        case ImpactType.CREDIT_SCORE_CHANGE:
            newState.creditScore = Math.max(300, Math.min(850, newState.creditScore + impact.amount));
            break;
        case ImpactType.HAPPINESS_CHANGE:
            newState.happiness = Math.max(0, Math.min(100, newState.happiness + impact.amount));
            break;
    }
    return newState;
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
        const playerState = getInitialPlayerState(action.payload);
        return {
            ...initialState,
            playerState,
            gamePhase: 'turn_end',
        };
    }
    case 'SET_PLAYER_STATE':
        return {
            ...state,
            playerState: action.payload,
            gamePhase: 'turn_end'
        };
    case 'SET_EVENT':
      return { ...state, currentEvent: action.payload, gamePhase: 'event' };
    
    case 'RESOLVE_CHOICE': {
        if (!state.playerState) return state;
        const { choice, eventTitle } = action.payload;
        let playerState = { ...state.playerState };
        if (choice.impact) {
            playerState = applyImpact(playerState, choice.impact);
        }
        playerState.xp += 50;
        
        const logSummary = `Chose: "${choice.text}". Outcome: ${choice.outcome}`;
        playerState = addLogEntry(playerState, eventTitle, logSummary, ['choice']);

        return { ...state, playerState, currentEvent: null, gamePhase: 'turn_end' };
    }
    case 'RESOLVE_SURVIVAL': {
        if (!state.playerState) return state;
        let playerState = JSON.parse(JSON.stringify(state.playerState)); // Deep copy
        const { method, cost, eventTitle } = action.payload;

        let logSummary = '';
        if (method === 'emergency_fund') {
            playerState.emergencyFund -= cost;
            logSummary = `Paid ${formatCurrency(cost)} from emergency fund.`;
        } else if (method === 'sell_asset') {
            playerState.financials.assets -= cost;
            logSummary = `Sold assets worth ${formatCurrency(cost)}.`;
        } else if (method === 'loan') {
            playerState.financials.liabilities += cost * 1.2;
            logSummary = `Took a loan for ${formatCurrency(cost)}, increasing liabilities.`;
        } else if (method === 'hardship') {
            playerState.happiness -= 20;
            playerState.creditScore -= 50;
            logSummary = `Faced hardship, reducing happiness and credit score.`;
        }
        playerState.xp += 75;
        playerState = addLogEntry(playerState, `SURVIVAL: ${eventTitle}`, logSummary, ['survival']);
        return { ...state, playerState, currentEvent: null, gamePhase: 'turn_end' };
    }
    case 'ADVANCE_YEAR': {
        if (!state.playerState) return state;
        let playerState = JSON.parse(JSON.stringify(state.playerState));

        const savings = playerState.financials.income - playerState.financials.expenses;
        playerState.emergencyFund += savings * 0.4;
        playerState.financials.assets += savings * 0.6;
        playerState.financials.assets *= 1.05;

        playerState.age += 1;
        playerState.xp += 100;
        
        if(playerState.xp >= playerState.level * XP_PER_LEVEL) {
            playerState.level += 1;
        }

        const netWorth = playerState.financials.assets - playerState.financials.liabilities + playerState.emergencyFund;
        playerState.history = [...playerState.history, { age: playerState.age, netWorth }];

        const nextStage = Object.keys(LIFE_STAGES).find((stage) => {
            const s = stage as LifeStage;
            return playerState.age >= LIFE_STAGES[s].ageRange[0] && playerState.age <= LIFE_STAGES[s].ageRange[1];
        }) as LifeStage | undefined;
        
        if(nextStage && nextStage !== playerState.stage) {
            playerState.stage = nextStage;
            if(LIFE_STAGES[nextStage]?.bonus) {
                playerState.emergencyFund += LIFE_STAGES[nextStage]!.bonus!.cash;
                playerState.xp += LIFE_STAGES[nextStage]!.bonus!.xp;
            }
             return { ...state, playerState, gamePhase: 'stage_transition' };
        }

        if(playerState.age % 2 === 0) {
            return { ...state, playerState, gamePhase: 'tax_minigame' };
        }

        return { ...state, playerState, gamePhase: 'turn_end' };
    }
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.payload };
    
    case 'BUY_INSURANCE': {
        if(!state.playerState) return state;
        const { name, ...policyData } = action.payload;
        const policy = { ...policyData, activeUntilAge: state.playerState.age + 10 };
        let playerState = {
            ...state.playerState,
            emergencyFund: state.playerState.emergencyFund - policy.annualPremium,
            insurance: [...state.playerState.insurance, policy]
        };
        const logSummary = `Purchased ${name} for a premium of ${formatCurrency(policy.annualPremium)}.`;
        playerState = addLogEntry(playerState, "Insurance Acquired", logSummary, ['insurance']);
        
        return { ...state, playerState };
    }
    case 'ACTIVATE_SKILL': {
         if(!state.playerState) return state;
         const skill = SKILL_TREE_DATA.find(s => s.id === action.payload);
         if (!skill || state.playerState.xp < skill.activationCost) return state;

         let tempState = JSON.parse(JSON.stringify(state.playerState)); // deep copy
         tempState.skills[action.payload] = { status: 'unlocked', unlockedAt: new Date().toISOString() };
         tempState.xp -= skill.activationCost;

         SKILL_TREE_DATA.forEach(s => {
             if(s.prerequisite(tempState) && tempState.skills[s.id]?.status === 'locked') {
                 tempState.skills[s.id] = { status: 'available', unlockedAt: null };
             }
         });
         
         const logSummary = `Unlocked '${skill.name}' for ${skill.activationCost} XP.`;
         tempState = addLogEntry(tempState, "Skill Unlocked", logSummary, ['skill_unlock']);
         
         return { ...state, playerState: tempState };
    }
    case 'COMPLETE_TAX_MINIGAME': {
        if (!state.playerState) return state;
        const { taxSaved, deductions } = action.payload;
        let playerState = {
            ...state.playerState,
            emergencyFund: state.playerState.emergencyFund + taxSaved,
        };
        const logSummary = `Filed taxes with ${formatCurrency(deductions)} in deductions, saving ${formatCurrency(taxSaved)}.`;
        playerState = addLogEntry(playerState, "Tax Season Complete", logSummary, ['tax_minigame']);
        return { ...state, playerState, gamePhase: 'turn_end' };
    }
    case 'SET_GAME_PHASE':
        return { ...state, gamePhase: action.payload };
    case 'TRIGGER_CRISIS':
         if (!state.playerState) return state;
         let playerState = {
            ...state.playerState,
            crisis: {...action.payload, currentMonth: 0 }
         };
         playerState = addLogEntry(playerState, `CRISIS START: ${action.payload.name}`, action.payload.description, ['crisis']);
        return {
            ...state,
            playerState,
            gamePhase: 'crisis',
            crisisHistory: [state.playerState!]
        }
    case 'ADVANCE_CRISIS_MONTH': {
        if (!state.playerState || !state.playerState.crisis) return state;
        let playerState = JSON.parse(JSON.stringify(state.playerState));
        const crisis = playerState.crisis;
        
        crisis.currentMonth++;

        const monthlyIncome = (playerState.financials.income / 12) * (1 - crisis.effects.incomeReduction);
        const monthlyExpenses = (playerState.financials.expenses / 12) * (1 + crisis.effects.expenseIncrease);
        const cashflow = monthlyIncome - monthlyExpenses;
        
        playerState.emergencyFund += cashflow;
        playerState.financials.assets *= (1 + crisis.effects.assetVolatility / 12);
        
        const netWorth = playerState.financials.assets - playerState.financials.liabilities + playerState.emergencyFund;
        
        if (playerState.emergencyFund <= 0 || netWorth < crisis.survivalThreshold) {
            return { ...state, playerState, gamePhase: 'crisis_lost' };
        }
        
        if (crisis.currentMonth > crisis.duration) {
             return { ...state, playerState, gamePhase: 'crisis_won' };
        }

        return {
            ...state,
            playerState,
            gamePhase: 'turn_end',
            crisisHistory: [...state.crisisHistory, playerState]
        }
    }
    case 'END_CRISIS': {
        if (!state.playerState) return state;
        let playerState = {...state.playerState, crisis: null};
        if(action.payload.result === 'won') {
            playerState.xp += CRISIS_REWARDS.victoryXp;
            const newBadge = { ...CRISIS_REWARDS.badge, timestamp: new Date().toISOString()};
            playerState.achievements = [...playerState.achievements, newBadge];
            playerState = addLogEntry(playerState, "CRISIS SURVIVED", `Successfully navigated the ${state.playerState.crisis?.name}.`, ['crisis', 'achievement']);
        }
        return {
            ...state,
            playerState,
            gamePhase: 'turn_end',
            crisisHistory: []
        };
    }
    case 'ROLLBACK_CRISIS_MONTH': {
        const lastState = state.crisisHistory.pop();
        if(!lastState) return state;
        return {
            ...state,
            playerState: lastState,
            gamePhase: 'turn_end',
            crisisHistory: state.crisisHistory,
        }
    }
    case 'UPDATE_PRESENTER_ASSETS': {
        if (!state.playerState) return state;
        return {
            ...state,
            playerState: {
                ...state.playerState,
                presenterAssets: {
                    ...state.playerState.presenterAssets,
                    qa: action.payload,
                }
            }
        };
    }
    default:
      return state;
  }
};


export const useGameState = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(async (profile: PlayerProfile) => {
    dispatch({ type: 'START_GAME', payload: profile });
  }, []);

  const loadGame = useCallback((json: string) => {
      try {
        const loadedState: PlayerState = JSON.parse(json);
        if (loadedState.name && loadedState.age) {
             dispatch({ type: 'SET_PLAYER_STATE', payload: loadedState });
        }
      } catch (e) {
          console.error("Failed to load game state:", e);
      }
  }, []);

  const setEvent = useCallback((event: LifeEvent) => {
    dispatch({ type: 'SET_EVENT', payload: event });
  }, []);

  const resolveChoice = useCallback((choice: PlayerChoice, eventTitle: string) => {
    dispatch({ type: 'RESOLVE_CHOICE', payload: { choice, eventTitle } });
  }, []);

  const resolveSurvival = useCallback((method: string, cost: number, eventTitle: string) => {
      dispatch({ type: 'RESOLVE_SURVIVAL', payload: { method, cost, eventTitle }});
  }, []);

  const advanceYear = useCallback(() => {
    dispatch({ type: 'ADVANCE_YEAR' });
    return gameReducer(state, { type: 'ADVANCE_YEAR' }).gamePhase;
  }, [state]);

  const openModal = useCallback((modal: 'insurance' | 'skillTree' | 'presenterTools' | null) => {
      dispatch({ type: 'OPEN_MODAL', payload: modal });
  }, []);

  const buyInsurance = useCallback((policy: Omit<InsurancePolicy, 'activeUntilAge'> & { name: string }) => {
      dispatch({ type: 'BUY_INSURANCE', payload: policy });
  }, []);

  const activateSkill = useCallback((skillId: SkillName) => {
      dispatch({ type: 'ACTIVATE_SKILL', payload: skillId });
  }, []);
  
  const completeTaxMinigame = useCallback((deductions: number, taxSaved: number) => {
      dispatch({ type: 'COMPLETE_TAX_MINIGAME', payload: { deductions, taxSaved }});
  }, []);
  
  const triggerCrisis = useCallback((crisis: CrisisState) => {
      dispatch({ type: 'TRIGGER_CRISIS', payload: crisis });
  }, []);
  
  const advanceCrisisMonth = useCallback(() => {
    dispatch({ type: 'ADVANCE_CRISIS_MONTH' });
    return gameReducer(state, { type: 'ADVANCE_CRISIS_MONTH' }).gamePhase;
  }, [state]);

  const endCrisis = useCallback((result: 'won' | 'lost') => {
      dispatch({ type: 'END_CRISIS', payload: { result }});
  }, []);
  
  const rollbackCrisisMonth = useCallback(() => {
      dispatch({ type: 'ROLLBACK_CRISIS_MONTH' });
  }, []);
  
  const updatePresenterAssets = useCallback((qa: PresenterQA[]) => {
      dispatch({ type: 'UPDATE_PRESENTER_ASSETS', payload: qa });
  }, []);

  return {
    ...state,
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
    updatePresenterAssets,
  };
};