export type RoastLevel = 'Light' | 'Medium' | 'Dark';
export type Strength = 'Light' | 'Medium' | 'Strong';
export type BrewProfile = 'Balanced' | 'Bright' | 'Easy';

export interface BrewStep {
  type: 'Bloom' | 'Soak' | 'Pour' | 'Wait';
  duration: number; // in seconds
  targetWeight: number; // in grams
  instruction: string;
}

export const STRENGTH_RATIOS = {
  Light: 17,
  Medium: 15.5,
  Strong: 14,
};

export const calculateWater = (coffeeWeight: number, strength: Strength): number => {
  return coffeeWeight * STRENGTH_RATIOS[strength];
};

export const suggestTemp = (roastLevel: RoastLevel): string => {
  switch (roastLevel) {
    case 'Light': return '> 205°F';
    case 'Medium': return '195°F';
    case 'Dark': return '< 190°F';
  }
};

export const getTasteLabel = (val: number) => {
  if (val < 20) return "VERY SOUR";
  if (val < 40) return "SOUR";
  if (val < 60) return "BALANCED";
  if (val < 80) return "BITTER";
  return "VERY BITTER";
};

export const generateSteps = (
  profile: BrewProfile,
  coffeeWeight: number,
  totalWater: number
): BrewStep[] => {
  const steps: BrewStep[] = [];
  const bloomWeight = coffeeWeight * 2;

  // Initial Bloom & Soak (Common for all)
  steps.push({
    type: 'Bloom',
    duration: 15,
    targetWeight: bloomWeight,
    instruction: `Bloom with ${bloomWeight}g of water`
  });
  steps.push({
    type: 'Soak',
    duration: 15,
    targetWeight: bloomWeight,
    instruction: 'Allow the coffee to degas'
  });

  const remainingWater = totalWater - bloomWeight;

  if (profile === 'Balanced') {
    // 4 pours of 20s each
    const pourWeight = remainingWater / 4;
    const totalTimeGoal = 210; // 3.5 mins
    const currentElapsedTime = 30 + (4 * 20); // 110s
    const remainingTime = totalTimeGoal - currentElapsedTime;
    const waitInterval = Math.max(10, Math.floor(remainingTime / 4));

    for (let i = 1; i <= 4; i++) {
      const currentTarget = bloomWeight + (pourWeight * i);
      steps.push({
        type: 'Pour',
        duration: 20,
        targetWeight: Math.round(currentTarget),
        instruction: `Pour to ${Math.round(currentTarget)}g`
      });
      steps.push({
        type: 'Wait',
        duration: waitInterval,
        targetWeight: Math.round(currentTarget),
        instruction: i === 4 ? 'Allow to drain completely' : 'Wait for water to draw down'
      });
    }
  } else if (profile === 'Bright') {
    // 2 pours of 20s each
    const pourWeight = remainingWater / 2;
    const totalTimeGoal = 180; // 3 mins
    const currentElapsedTime = 30 + (2 * 20); // 70s
    const remainingTime = totalTimeGoal - currentElapsedTime;
    const waitInterval = Math.max(10, Math.floor(remainingTime / 2));

    for (let i = 1; i <= 2; i++) {
      const currentTarget = bloomWeight + (pourWeight * i);
      steps.push({
        type: 'Pour',
        duration: 20,
        targetWeight: Math.round(currentTarget),
        instruction: `Pour to ${Math.round(currentTarget)}g`
      });
      steps.push({
        type: 'Wait',
        duration: waitInterval,
        targetWeight: Math.round(currentTarget),
        instruction: i === 2 ? 'Allow to drain completely' : 'Wait for water to draw down'
      });
    }
  } else if (profile === 'Easy') {
    // 1 slow continuous pour of 90s
    steps.push({
      type: 'Pour',
      duration: 90,
      targetWeight: Math.round(totalWater),
      instruction: `Slow continuous pour to ${Math.round(totalWater)}g`
    });
    steps.push({
      type: 'Wait',
      duration: 60,
      targetWeight: Math.round(totalWater),
      instruction: 'Allow to drain completely'
    });
  }

  return steps;
};
