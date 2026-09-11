/**
 * Utility functions for Student Grade Calculations
 */

export interface GradeScaleItem {
  letter: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  color: string;
}

export const DEFAULT_GRADE_SCALE: GradeScaleItem[] = [
  { letter: 'A+', minPercentage: 90, maxPercentage: 100, description: 'Outstanding / High Distinction', color: 'emerald' },
  { letter: 'A', minPercentage: 85, maxPercentage: 89.999, description: 'Excellent Performance', color: 'emerald' },
  { letter: 'A-', minPercentage: 80, maxPercentage: 84.999, description: 'Very Good Performance', color: 'teal' },
  { letter: 'B+', minPercentage: 75, maxPercentage: 79.999, description: 'Good Performance', color: 'blue' },
  { letter: 'B', minPercentage: 70, maxPercentage: 74.999, description: 'Above Average', color: 'blue' },
  { letter: 'B-', minPercentage: 65, maxPercentage: 69.999, description: 'Average Performance', color: 'cyan' },
  { letter: 'C+', minPercentage: 60, maxPercentage: 64.999, description: 'Satisfactory', color: 'amber' },
  { letter: 'C', minPercentage: 55, maxPercentage: 59.999, description: 'Marginal Pass', color: 'amber' },
  { letter: 'C-', minPercentage: 50, maxPercentage: 54.999, description: 'Minimum Pass', color: 'orange' },
  { letter: 'D', minPercentage: 40, maxPercentage: 49.999, description: 'Conditional Pass / Weak', color: 'rose' },
  { letter: 'F', minPercentage: 0, maxPercentage: 39.999, description: 'Failing Grade', color: 'rose' },
];

export interface AssessmentItem {
  id: string;
  name: string;
  obtained: string;
  total: string;
  weight: string;
}

export interface CalculatedAssessment {
  id: string;
  name: string;
  obtained: number;
  total: number;
  weight: number;
  percentage: number;
  weightedContribution: number;
}

export interface GradeCalculationResult {
  mode: 'simple' | 'weighted';
  assessments: CalculatedAssessment[];
  totalObtainedMarks: number;
  totalPossibleMarks: number;
  percentage: number;
  letterGrade: string;
  gradeDescription: string;
  gradeColor: string;
  totalWeight: number;
  isPartial: boolean;
  normalizedPercentage: number; // percentage scaled to completed weight
  warning?: string;
}

/**
 * Finds the corresponding letter grade from percentage
 */
export function getGradeFromPercentage(
  percentage: number,
  scale: GradeScaleItem[] = DEFAULT_GRADE_SCALE
): { letter: string; description: string; color: string } {
  const clamped = Math.max(0, Math.min(100, percentage));
  for (const item of scale) {
    if (clamped >= item.minPercentage && clamped <= item.maxPercentage) {
      return {
        letter: item.letter,
        description: item.description,
        color: item.color,
      };
    }
  }
  return { letter: 'F', description: 'Failing Grade', color: 'rose' };
}

/**
 * Calculates grade in Simple Marks Mode or Weighted Mode
 */
export function calculateGrades(
  items: AssessmentItem[],
  mode: 'simple' | 'weighted',
  scale: GradeScaleItem[] = DEFAULT_GRADE_SCALE
): GradeCalculationResult {
  const calculatedItems: CalculatedAssessment[] = [];
  let totalObtained = 0;
  let totalPossible = 0;
  let totalWeight = 0;
  let sumWeightedContribution = 0;

  items.forEach((item) => {
    const ob = parseFloat(item.obtained) || 0;
    const tot = parseFloat(item.total) || 0;
    const wt = parseFloat(item.weight) || 0;

    const pct = tot > 0 ? (ob / tot) * 100 : 0;
    const contribution = (pct * wt) / 100;

    calculatedItems.push({
      id: item.id,
      name: item.name || 'Assessment',
      obtained: ob,
      total: tot,
      weight: wt,
      percentage: pct,
      weightedContribution: contribution,
    });

    totalObtained += ob;
    totalPossible += tot;
    totalWeight += wt;
    sumWeightedContribution += contribution;
  });

  let percentage = 0;
  let isPartial = false;
  let warning: string | undefined;

  if (mode === 'simple') {
    percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
  } else {
    percentage = sumWeightedContribution;
    if (Math.abs(totalWeight - 100) > 0.01) {
      isPartial = totalWeight < 100;
      if (totalWeight < 100) {
        warning = `Total assessment weights sum to ${totalWeight.toFixed(1)}% (less than 100%). Currently displaying partial grade.`;
      } else {
        warning = `Total assessment weights sum to ${totalWeight.toFixed(1)}% (exceeds 100%). Please adjust weights to ensure accurate results.`;
      }
    }
  }

  // Normalized percentage: if partial weighted (e.g. only 60% of term completed, what is current average?)
  const normalizedPercentage =
    mode === 'weighted' && totalWeight > 0 && totalWeight < 100
      ? (sumWeightedContribution / totalWeight) * 100
      : percentage;

  const gradeInfo = getGradeFromPercentage(percentage, scale);

  return {
    mode,
    assessments: calculatedItems,
    totalObtainedMarks: totalObtained,
    totalPossibleMarks: totalPossible,
    percentage,
    letterGrade: gradeInfo.letter,
    gradeDescription: gradeInfo.description,
    gradeColor: gradeInfo.color,
    totalWeight,
    isPartial,
    normalizedPercentage,
    warning,
  };
}

/**
 * Calculates target score needed on remaining exam weight
 */
export function calculateTargetFinalScore(
  currentWeightedContribution: number,
  completedWeight: number,
  targetGradePercentage: number
): {
  remainingWeight: number;
  requiredPercentageOnRemaining: number;
  isAchievable: boolean;
  message: string;
} {
  const remainingWeight = Math.max(0, 100 - completedWeight);

  if (remainingWeight <= 0) {
    return {
      remainingWeight: 0,
      requiredPercentageOnRemaining: 0,
      isAchievable: false,
      message: 'All 100% of the course weight has already been completed.',
    };
  }

  // Required: currentWeightedContribution + (requiredPct * remainingWeight / 100) >= targetGradePercentage
  // (requiredPct * remainingWeight / 100) >= targetGradePercentage - currentWeightedContribution
  // requiredPct >= (targetGradePercentage - currentWeightedContribution) * 100 / remainingWeight
  const pointsNeeded = targetGradePercentage - currentWeightedContribution;
  const requiredPercentage = (pointsNeeded * 100) / remainingWeight;

  if (requiredPercentage <= 0) {
    return {
      remainingWeight,
      requiredPercentageOnRemaining: 0,
      isAchievable: true,
      message: `You have already secured enough points to achieve ${targetGradePercentage}%, regardless of your final score!`,
    };
  }

  if (requiredPercentage > 100) {
    return {
      remainingWeight,
      requiredPercentageOnRemaining: requiredPercentage,
      isAchievable: false,
      message: `Achieving ${targetGradePercentage}% requires scoring ${requiredPercentage.toFixed(1)}% on the final ${remainingWeight}% weight, which exceeds the maximum possible 100%.`,
    };
  }

  return {
    remainingWeight,
    requiredPercentageOnRemaining: requiredPercentage,
    isAchievable: true,
    message: `You need to score at least ${requiredPercentage.toFixed(1)}% on the remaining ${remainingWeight}% assessment weight to secure your target grade of ${targetGradePercentage}%.`,
  };
}
