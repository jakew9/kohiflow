"use client";

import { useState, useEffect } from "react";
import { RoastLevel } from "@/lib/coffee-logic";
import { ArrowRight } from "lucide-react";
import BeanSelect from "./BeanSelect";
import EquipmentSelect from "./EquipmentSelect";

interface EspressoFormProps {
  onSave: (data: EspressoLog) => void;
  isSaving: boolean;
  initialData?: Partial<EspressoLog>;
}

export interface EspressoLog {
  coffeeWeight: number;
  yieldWeight: number;
  roastLevel: RoastLevel;
  beansUsed: string;
  beanId?: string;
  equipment: {
    machine: string;
    grinder: string;
    setting: string;
  };
  tastingProfile: 'Sour' | 'Bitter' | 'Balanced';
  notes: string;
  timestamp?: string;
}

export default function EspressoForm({ onSave, isSaving, initialData }: EspressoFormProps) {
  const [data, setData] = useState<EspressoLog>({
    coffeeWeight: 18,
    yieldWeight: 36,
    roastLevel: 'Medium',
    beansUsed: "",
    equipment: {
      machine: "",
      grinder: "",
      setting: "",
    },
    tastingProfile: 'Balanced',
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setData(prev => ({
        ...prev,
        ...initialData,
        equipment: {
          ...prev.equipment,
          ...(initialData.equipment || {})
        }
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-stone-grey bg-stone-grey/20 p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Core Stats */}
        <div className="space-y-6">
          <h3 className="text-xs tracking-widest text-walnut uppercase">Extraction</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Dose (g)</label>
            <input
              type="number"
              step="0.1"
              value={data.coffeeWeight}
              onChange={(e) => setData({ ...data, coffeeWeight: Number(e.target.value) })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Yield (g)</label>
            <input
              type="number"
              step="0.1"
              value={data.yieldWeight}
              onChange={(e) => setData({ ...data, yieldWeight: Number(e.target.value) })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Roast Profile</label>
            <select
              value={data.roastLevel}
              onChange={(e) => setData({ ...data, roastLevel: e.target.value as RoastLevel })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut appearance-none"
            >
              <option value="Light" className="bg-matte-black">Light</option>
              <option value="Medium" className="bg-matte-black">Medium</option>
              <option value="Dark" className="bg-matte-black">Dark</option>
            </select>
          </div>
        </div>

        {/* Equipment & Beans */}
        <div className="space-y-6">
          <h3 className="text-xs tracking-widest text-walnut uppercase">Setup</h3>
          
          <BeanSelect 
            value={data.beansUsed} 
            onChange={(name, id) => setData({ ...data, beansUsed: name, beanId: id })} 
          />

          <EquipmentSelect
            label="Machine"
            value={data.equipment.machine}
            type="Machine"
            method="Espresso"
            onChange={(val) => setData({ ...data, equipment: { ...data.equipment, machine: val } })}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <EquipmentSelect
                label="Grinder"
                value={data.equipment.grinder}
                type="Grinder"
                method="Espresso"
                onChange={(val) => setData({ ...data, equipment: { ...data.equipment, grinder: val } })}
              />
            </div>
            <div className="w-24 space-y-2">
              <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Setting</label>
              <input
                type="text"
                placeholder="15..."
                value={data.equipment.setting}
                onChange={(e) => setData({ ...data, equipment: { ...data.equipment, setting: e.target.value } })}
                className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors text-center"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-walnut py-4 text-sm font-light tracking-[0.2em] text-matte-black transition-all hover:opacity-90 disabled:opacity-50"
      >
        {isSaving ? "CONTINUING..." : "NEXT: EVALUATE"} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
