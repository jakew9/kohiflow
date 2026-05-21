"use client";

import { useState, useEffect } from "react";
import { RoastLevel, Strength, BrewProfile, calculateWater, suggestTemp } from "@/lib/coffee-logic";
import { ArrowRight } from "lucide-react";
import BeanSelect from "./BeanSelect";
import EquipmentSelect from "./EquipmentSelect";

interface PourOverFormProps {
  onStart: (config: {
    coffeeWeight: number;
    roastLevel: RoastLevel;
    waterType: string;
    strength: Strength;
    profile: BrewProfile;
    totalWater: number;
    equipment: string;
    beansUsed: string;
    beanId?: string;
    grinder: string;
    grinderSetting: string;
  }) => void;
  initialData?: {
    coffeeWeight?: number;
    grinder?: string;
    grinderSetting?: string;
    equipment?: string;
  };
}

export default function PourOverForm({ onStart, initialData }: PourOverFormProps) {
  const [coffeeWeight, setCoffeeWeight] = useState(20);
  const [roastLevel, setRoastLevel] = useState<RoastLevel>('Medium');
  const [waterType, setWaterType] = useState('Filtered');
  const [strength, setStrength] = useState<Strength>('Medium');
  const [profile, setProfile] = useState<BrewProfile>('Balanced');
  const [equipment, setEquipment] = useState("");
  const [beansUsed, setBeansUsed] = useState("");
  const [beanId, setBeanId] = useState<string | undefined>();
  const [grinder, setGrinder] = useState("");
  const [grinderSetting, setGrinderSetting] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.coffeeWeight) setCoffeeWeight(initialData.coffeeWeight);
      if (initialData.grinder) setGrinder(initialData.grinder);
      if (initialData.grinderSetting) setGrinderSetting(initialData.grinderSetting);
      if (initialData.equipment) setEquipment(initialData.equipment);
    }
  }, [initialData]);

  const totalWater = calculateWater(coffeeWeight, strength);
  const suggestedTemp = suggestTemp(roastLevel);

  return (
    <div className="mx-auto max-w-xl space-y-8 rounded-2xl border border-stone-grey bg-stone-grey/20 p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Beans & Grinder */}
        <div className="col-span-full space-y-4 border-b border-stone-grey pb-6">
          <BeanSelect 
            value={beansUsed} 
            onChange={(name, id) => {
              setBeansUsed(name);
              setBeanId(id);
            }} 
          />
          <div className="grid grid-cols-2 gap-4">
            <EquipmentSelect
              label="Brewer"
              value={equipment}
              type="Machine"
              method="Pour Over"
              onChange={setEquipment}
            />
            <EquipmentSelect
              label="Grinder"
              value={grinder}
              type="Grinder"
              method="Pour Over"
              onChange={setGrinder}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Grinder Setting</label>
            <input
              type="text"
              value={grinderSetting}
              onChange={(e) => setGrinderSetting(e.target.value)}
              placeholder="e.g. 15..."
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          </div>
        </div>

        {/* Coffee Weight */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Coffee Weight (g)</label>
          <input
            type="number"
            value={coffeeWeight}
            onChange={(e) => setCoffeeWeight(Number(e.target.value))}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut"
          />
        </div>

        {/* Roast Level */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Roast Level</label>
          <select
            value={roastLevel}
            onChange={(e) => setRoastLevel(e.target.value as RoastLevel)}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut appearance-none"
          >
            <option value="Light" className="bg-matte-black">Light</option>
            <option value="Medium" className="bg-matte-black">Medium</option>
            <option value="Dark" className="bg-matte-black">Dark</option>
          </select>
        </div>

        {/* Strength */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Strength</label>
          <div className="flex gap-2">
            {(['Light', 'Medium', 'Strong'] as Strength[]).map((s) => (
              <button
                key={s}
                onClick={() => setStrength(s)}
                className={`flex-1 rounded-lg border py-2 text-[10px] tracking-widest transition-all ${
                  strength === s ? 'border-walnut bg-walnut/10 text-walnut' : 'border-stone-grey text-stone-grey-foreground/60'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Brew Profile</label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as BrewProfile)}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut appearance-none"
          >
            <option value="Balanced" className="bg-matte-black">Balanced (5 Pours)</option>
            <option value="Bright" className="bg-matte-black">Bright (3 Pours)</option>
            <option value="Easy" className="bg-matte-black">Easy (Slow Pour)</option>
          </select>
        </div>

        {/* Water Type */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Water Type</label>
          <select
            value={waterType}
            onChange={(e) => setWaterType(e.target.value)}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut appearance-none"
          >
            <option value="Tap" className="bg-matte-black">Tap</option>
            <option value="Spring" className="bg-matte-black">Spring</option>
            <option value="Distilled" className="bg-matte-black">Distilled</option>
            <option value="Filtered" className="bg-matte-black">Filtered</option>
          </select>
        </div>

        {/* Suggested Temp (Display Only) */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Suggested Temp</label>
          <div className="py-2 text-xl font-light text-walnut/80">{suggestedTemp}</div>
        </div>
      </div>

      <div className="border-t border-stone-grey pt-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Target Water</span>
          <span className="text-2xl font-light text-walnut">{totalWater}g</span>
        </div>

        <button
          onClick={() => onStart({ coffeeWeight, roastLevel, waterType, strength, profile, totalWater, equipment, beansUsed, beanId, grinder, grinderSetting })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-walnut py-4 text-sm font-light tracking-[0.2em] text-matte-black transition-opacity hover:opacity-90"
        >
          START BREW <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
