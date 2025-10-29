import type { PlayerState } from '../types';
import { CAREER_RISK_FACTORS } from '../constants';

/**
 * Calculates a player's overall risk exposure score (0-100).
 * @param playerState The current state of the player.
 * @returns A number representing the risk score.
 */
export const calculateRiskExposure = (playerState: PlayerState): number => {
    // 1. Start with career risk
    const careerRisk = CAREER_RISK_FACTORS[playerState.career.name] || 20; // Default risk if career not listed

    // 2. Add risk based on assets (more assets = more to lose/protect)
    // Scale asset risk so that it contributes meaningfully but doesn't dominate.
    // Let's say every 10 Lakhs in assets adds 5 points to risk, maxing out at 50 points.
    const assetValue = playerState.financials.assets + playerState.emergencyFund;
    const assetRisk = Math.min(50, Math.floor(assetValue / 1000000) * 5);

    // 3. Reduce risk based on having an emergency fund (acts as self-insurance)
    // A healthy emergency fund (e.g., 6+ months of expenses) can significantly reduce risk.
    const monthlyExpenses = playerState.financials.expenses / 12;
    const emergencyMonths = monthlyExpenses > 0 ? playerState.emergencyFund / monthlyExpenses : 0;
    const preparednessBonus = Math.min(20, Math.floor(emergencyMonths) * 4); // Max 20 point reduction

    // 4. Factor in insurance coverage
    const insuranceCoverage = playerState.insurance.length * 10; // 10 points reduction per policy
    
    // Calculate final score
    let totalRisk = careerRisk + assetRisk - preparednessBonus - insuranceCoverage;

    // Clamp the value between a reasonable range, e.g., 5 to 95.
    return Math.max(5, Math.min(95, Math.round(totalRisk)));
};
