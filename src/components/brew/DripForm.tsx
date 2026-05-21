"use client";

import { useState, useEffect } from "react";
import { RoastLevel } from "@/lib/coffee-logic";
import { ArrowRight } from "lucide-react";
import BeanSelect from "./BeanSelect";
import EquipmentSelect from "./EquipmentSelect";

interface DripFormProps {
  onSave: (data: DripLog) => void;
  isSaving: boolean;
  initialData?: Partial<DripLog>;
}

export interface DripLog {
  coffeeWeight: number;
  roastLevel: RoastLevel;
  brewTime: string;
  beansUsed: string;
  beanId?: string;
  equipment: {
    machine: string;
    grinder: string;
    setting: string;
  };
}

export default function DripForm({ onSave, isSaving, initialData }: DripFormProps) {
  const [data, setData] = useState<DripLog>({
    coffeeWeight: 20,
    roastLevel: 'Medium',
    brewTime: "05:00",
    beansUsed: "",
    equipment: {
      machine: "",
      grinder: "",
      setting: "",
    },
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
        {/* Core Stats Section */}
        <div className="space-y-6">
          <h3 className="text-xs tracking-widest text-walnut uppercase">Brew Stats</h3>
          
          <BeanSelect 
            value={data.beansUsed} 
            onChange={(name, id) => setData({ ...data, beansUsed: name, beanId: id })} 
          />

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Coffee Weight (g)</label>
            <input
              type="number"
              value={data.coffeeWeight}
              onChange={(e) => setData({ ...data, coffeeWeight: Number(e.target.value) })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Roast Level</label>
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

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Brewing Time</label>
            <input
              type="text"
              placeholder="e.g. 05:00"
              value={data.brewTime}
              onChange={(e) => setData({ ...data, brewTime: e.target.value })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          </div>
        </div>

        {/* Equipment Section */}
        <div className="space-y-6">
          <h3 className="text-xs tracking-widest text-walnut uppercase">Equipment</h3>
          
          <EquipmentSelect
            label="Machine"
            value={data.equipment.machine}
            type="Machine"
            method="Drip"
            onChange={(val) => setData({ ...data, equipment: { ...data.equipment, machine: val } })}
          />

          <EquipmentSelect
            label="Grinder"
            value={data.equipment.grinder}
            type="Grinder"
            method="Drip"
            onChange={(val) => setData({ ...data, equipment: { ...data.equipment, grinder: val } })}
          />

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Grinder Setting</label>
            <input
              type="text"
              placeholder="5.1..."
              value={data.equipment.setting}
              onChange={(e) => setData({ ...data, equipment: { ...data.equipment, setting: e.target.value } })}
              className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
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
