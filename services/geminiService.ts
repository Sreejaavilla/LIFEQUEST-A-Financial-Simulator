import { GoogleGenAI, Type } from '@google/genai';
import type { PlayerState, LifeEvent, CrisisState } from '../types';
import { ImpactType } from '../types';
import { SURVIVAL_EVENT_CHANCE } from '../constants';

// IMPORTANT: Do not expose this key publicly.
// It is assumed that process.env.API_KEY is configured in the build environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const lifeEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, engaging title for the event (e.g., 'Unexpected Promotion!', 'Sudden Car Trouble')." },
        description: { type: Type.STRING, description: "A one or two-sentence description of the life event." },
        type: { type: Type.STRING, description: "The type of event. Must be either 'CHOICE' for events with player choices or 'CONSEQUENCE' for direct outcomes." },
        isSurvival: { type: Type.BOOLEAN, description: "Set to true if this is a negative, urgent financial shock that requires a decision on how to pay for it." },
        cost: { type: Type.NUMBER, description: "The specific cost of the event, ONLY if isSurvival is true. Must be a positive number. Omit otherwise." },
        category: { type: Type.STRING, description: "The category of the event, ONLY if isSurvival is true. Must be one of: 'medical', 'vehicle', 'property', 'general'. Omit otherwise." },
        impact: {
            type: Type.OBJECT,
            description: "The financial impact if this is a 'CONSEQUENCE' event and isSurvival is false. Omit for 'CHOICE' or 'SURVIVAL' events.",
            properties: {
                type: { type: Type.STRING, description: `The type of financial impact. Must be one of: ${Object.values(ImpactType).join(', ')}` },
                amount: { type: Type.NUMBER, description: "The financial amount of the impact. Positive for gains, negative for losses. Should be a yearly amount for income/expense changes." },
                description: { type: Type.STRING, description: "A brief explanation of the financial impact (e.g., '+₹10,000 monthly salary', '-₹50,000 for car repair')." }
            },
            required: ['type', 'amount', 'description'],
        },
        choices: {
            type: Type.ARRAY,
            description: "An array of 2-3 choices for the player if the event type is 'CHOICE'. Omit for 'CONSEQUENCE' or 'SURVIVAL' events.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The text for the choice button (e.g., 'Invest aggressively', 'Play it safe')." },
                    outcome: { type: Type.STRING, description: "A short description of what happens if this choice is made." },
                    impact: {
                        type: Type.OBJECT,
                        description: "The financial impact of this specific choice. Can be omitted if there is no direct financial impact.",
                        properties: {
                             type: { type: Type.STRING, description: `The type of financial impact. Must be one of: ${Object.values(ImpactType).join(', ')}` },
                             amount: { type: Type.NUMBER, description: "The financial amount of the impact. Positive for gains, negative for losses." },
                             description: { type: Type.STRING, description: "A brief explanation of the financial impact." }
                        },
                        required: ['type', 'amount', 'description']
                    }
                },
                required: ['text', 'outcome']
            }
        }
    },
    required: ['title', 'description', 'type', 'isSurvival']
};


const generateAndParseEvent = async (prompt: string): Promise<LifeEvent> => {
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: lifeEventSchema,
                temperature: 0.9,
            }
        });
        
        const jsonText = response.text.trim();
        const eventData = JSON.parse(jsonText);
        
        if (!eventData.title || !eventData.description || !eventData.type) {
            throw new Error("Received malformed event data from API.");
        }
        
        return eventData as LifeEvent;

    } catch (error) {
        console.error("Error fetching life event from Gemini:", error);
        // Fallback event in case of API error
        return {
            title: "A Calm Year",
            description: "Sometimes, the most eventful thing to happen is nothing at all. You had a quiet, stable year, allowing you to focus on your finances without any major surprises.",
            type: 'CONSEQUENCE',
            isSurvival: false,
            impact: {
                type: ImpactType.NET_WORTH_CHANGE,
                amount: 0,
                description: "No unexpected financial changes this year."
            },
            choices: null,
        };
    }
};

/**
 * Generates a realistic life event using the Gemini API.
 * @param playerState The current state of the player.
 * @returns A promise that resolves to a LifeEvent object.
 */
export const getLifeEvent = async (playerState: PlayerState): Promise<LifeEvent> => {
    const { name, age, career, financials, emergencyFund, stage } = playerState;
    const netWorth = financials.assets - financials.liabilities + emergencyFund;
    const isSurvivalEvent = Math.random() < SURVIVAL_EVENT_CHANCE;

    let systemPrompt: string;

    if (isSurvivalEvent) {
        systemPrompt = `
            You are a financial life simulator AI called LifeQuest.
            Generate a realistic, negative "survival event" for a player in India.
            This is an unexpected, urgent expense.
            The event must be a 'CONSEQUENCE' type, with 'isSurvival' set to true.
            You MUST provide a specific 'cost' for the event. The cost should be a challenge, but potentially payable. A good range is 25% to 75% of their emergency fund.
            You MUST also provide a 'category' for the event from this list: 'medical', 'vehicle', 'property', 'general'.
            
            Example 'medical' event: Minor surgery, unexpected dental work.
            Example 'vehicle' event: Car engine failure, minor accident.
            Example 'property' event: Leaky roof, appliance breakdown.
            Example 'general' event: Lost expensive item, surprise tax bill.
            
            Do not provide 'impact' or 'choices' objects for a survival event.
        `;
    } else {
        systemPrompt = `
            You are a financial life simulator AI called LifeQuest.
            Generate a realistic and impactful standard life event for a player in India.
            The event should be appropriate for their age and current life stage. Be creative.
            - Early Career: Focus on career growth, learning, small investments, lifestyle inflation choices.
            - Mid-Career: Focus on family, housing, major investments, health, and work-life balance.
            - Late Career: Focus on retirement planning, health, legacy, and winding down work.
            Address the player by their name, ${name}.
            The event must be either a 'CONSEQUENCE' (something that just happens) or a 'CHOICE' (player must decide).
            Set 'isSurvival' to false. Do not provide a 'cost' or 'category'.
            - If it is a CHOICE, provide 2-3 distinct options with clear financial trade-offs.
            - If it is a CONSEQUENCE, provide a direct financial impact.
        `;
    }

    const prompt = `
      ${systemPrompt}

      Player's Profile:
      - Name: ${name}
      - Age: ${age}
      - Life Stage: ${stage}
      - Career: ${career.name}
      - Yearly Income: ₹${financials.income.toLocaleString('en-IN')}
      - Net Worth: ₹${netWorth.toLocaleString('en-IN')}
      - Emergency Fund: ₹${emergencyFund.toLocaleString('en-IN')}

      Return the event as a JSON object matching the provided schema. Ensure amounts for INCOME_CHANGE or EXPENSE_CHANGE are yearly figures.
    `;

    return generateAndParseEvent(prompt);
};

/**
 * Generates a crisis-specific life event.
 */
export const getCrisisEvent = async (playerState: PlayerState, crisisState: CrisisState): Promise<LifeEvent> => {
    const { name, age, emergencyFund } = playerState;
    const { currentMonth, duration, name: crisisName } = crisisState;

    const systemPrompt = `
        You are a financial crisis simulator AI. The player is in a severe economic downturn called "${crisisName}".
        This is month ${currentMonth} out of ${duration}. Their income is reduced, expenses are high, and they are under immense pressure.
        Generate a 'CHOICE' event that reflects a difficult trade-off someone would face in this situation. It must NOT be a 'survival' event with a 'cost'.
        The choices should be about cutting costs, finding new income, managing debt, or making personal sacrifices.
        Focus on tough decisions with clear pros and cons. The impacts should be immediate and significant (ONE_TIME_COST or ONE_TIME_GAIN).
        
        Example ideas:
        - Choice to sell a personal item (car, electronics) for a quick cash injection.
        - Choice to take a stressful, low-paying side job for extra income.
        - Choice to move to a cheaper apartment, but with a happiness penalty.
        - Choice to stop a subscription or hobby to save a small but psychologically important amount of money.

        Set 'isSurvival' to false.
        Provide 2-3 distinct choices with clear financial trade-offs.
    `;

    const prompt = `
        ${systemPrompt}

        Player's Situation:
        - Name: ${name}
        - Age: ${age}
        - Remaining Emergency Fund: ₹${emergencyFund.toLocaleString('en-IN')}
        
        Generate the JSON for this crisis month's event.
    `;

    return generateAndParseEvent(prompt);
}
