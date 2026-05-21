"use client";

import { useState, useEffect, useCallback } from "react";
import { BrewStep, generateSteps, BrewProfile, RoastLevel, Strength } from "@/lib/coffee-logic";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";

interface PourOverTimerProps {
  config: {
    coffeeWeight: number;
    roastLevel: RoastLevel;
    waterType: string;
    strength: Strength;
    profile: BrewProfile;
    totalWater: number;
    [key: string]: any;
  };
  onComplete: (log: any) => void;
  onCancel: () => void;
}

export default function PourOverTimer({ config, onComplete, onCancel }: PourOverTimerProps) {
  const [steps] = useState(() => generateSteps(config.profile, config.coffeeWeight, config.totalWater));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const totalBrewDuration = steps.reduce((acc, step) => acc + step.duration, 0);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const nextStep = useCallback(() => {
    if (isLastStep) {
      setIsActive(false);
      onComplete({
        ...config,
        totalTime: totalSeconds,
        date: new Date().toISOString(),
      });
      return;
    }
    setCurrentStepIndex((prev) => prev + 1);
    setTimeLeft(steps[currentStepIndex + 1].duration);
  }, [currentStepIndex, isLastStep, steps, onComplete, config, totalSeconds]);

  const handleSkip = () => {
    nextStep();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      nextStep();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, nextStep]);

  const progress = (1 - timeLeft / currentStep.duration) * 100;
  const completedStepsDuration = steps.slice(0, currentStepIndex).reduce((acc, step) => acc + step.duration, 0);
  const totalProgress = ((completedStepsDuration + (currentStep.duration - timeLeft)) / totalBrewDuration) * 100;

  return (
    <div className="mx-auto max-w-xl text-center">
      {/* Global Progress Bar */}
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-stone-grey/20">
        <motion.div
          className="h-full bg-walnut"
          initial={{ width: 0 }}
          animate={{ width: `${totalProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mb-12 pt-8">
        <h3 className="mb-2 text-xs tracking-[0.3em] text-walnut uppercase">
          {currentStep.type === 'Wait' ? 'WAITING' : 'POURING NOW'}
        </h3>
        <div className="text-8xl font-extralight tracking-tighter text-foreground">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12 h-1 w-full overflow-hidden rounded-full bg-stone-grey/30">
        <motion.div
          className="absolute left-0 top-0 h-full bg-walnut"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="mb-16 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <p className="text-xl font-light tracking-wide">{currentStep.instruction}</p>
            <p className="text-sm tracking-widest text-stone-grey-foreground/60 uppercase">
              Target: <span className="text-walnut">{currentStep.targetWeight}g</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-8">
        <button
          onClick={onCancel}
          className="rounded-full border border-stone-grey p-4 text-stone-grey-foreground/60 transition-colors hover:border-red-900/50 hover:text-red-500"
        >
          <RotateCcw className="h-6 w-6" />
        </button>

        <button
          onClick={() => setIsActive(!isActive)}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-walnut text-matte-black transition-transform hover:scale-105"
        >
          {isActive ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
        </button>

        <button
          onClick={handleSkip}
          className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-walnut/60 transition-colors hover:text-walnut"
        >
          <span className="rounded-full border border-walnut/20 px-4 py-2 transition-colors group-hover:border-walnut">
            SKIP
          </span>
        </button>
      </div>

      <div className="mt-12 text-xs tracking-widest text-stone-grey-foreground/40 uppercase">
        Step {currentStepIndex + 1} of {steps.length}
      </div>
    </div>
  );
}
