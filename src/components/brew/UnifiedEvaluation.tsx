"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/lib/toast-provider";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { getTasteLabel } from "@/lib/coffee-logic";

interface UnifiedEvaluationProps {
  brewData: {
    coffeeWeight: number;
    roastLevel?: string;
    beansUsed?: string;
    beanId?: string;
    equipment?: any;
    grinder?: string;
    grinderSetting?: string;
    totalWater?: number;
    yieldWeight?: number;
    brewTime?: string;
    [key: string]: any;
  };
  method: string;
  onCancel?: () => void;
}

export default function UnifiedEvaluation({ brewData, method, onCancel }: UnifiedEvaluationProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(7);
  const [tasteProfile, setTasteProfile] = useState(50);
  const [notes, setNotes] = useState("");
  const [improvements, setImprovements] = useState("");
  const [saveAsRecipe, setSaveAsRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const userId = auth.currentUser?.uid || "anonymous";
      
      // Save the brew log
      await addDoc(collection(db, `users/${userId}/logs`), {
        ...brewData,
        method,
        equipment: brewData.equipment || "", 
        rating,
        tasteProfile,
        notes,
        improvements,
        timestamp: new Date().toISOString(),
      });

      // Optionally save as a recipe
      if (saveAsRecipe && recipeName) {
        await addDoc(collection(db, `users/${userId}/recipes`), {
          name: recipeName,
          method,
          coffeeWeight: brewData.coffeeWeight,
          waterWeight: brewData.totalWater || brewData.yieldWeight || 0,
          grinder: brewData.grinder || brewData.equipment?.grinder || "",
          grinderSetting: brewData.grinderSetting || brewData.equipment?.setting || "",
          equipment: brewData.equipment?.machine || brewData.equipment || "",
          notes: notes,
          timestamp: new Date().toISOString(),
        });
        showToast("Recipe saved to library");
      }

      showToast("Brew logged successfully");
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/history');
      }, 1500);
    } catch (error) {
      console.error("Error saving brew log:", error);
      showToast("Failed to save brew", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-12 py-8">
      <header className="text-center">
        <h3 className="mb-2 text-xs tracking-[0.3em] text-walnut uppercase">Evaluation</h3>
        <h2 className="text-3xl font-light tracking-widest uppercase">RATE YOUR BREW</h2>
      </header>

      <div className="space-y-12 rounded-2xl border border-stone-grey bg-stone-grey/20 p-8">
        {/* Save as Recipe Toggle */}
        <div className="border-b border-stone-grey pb-8">
          <label className="flex items-center gap-3 cursor-pointer group mb-4">
            <input
              type="checkbox"
              checked={saveAsRecipe}
              onChange={(e) => setSaveAsRecipe(e.target.checked)}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${saveAsRecipe ? 'bg-walnut border-walnut' : 'border-stone-grey group-hover:border-walnut/50'}`}>
              {saveAsRecipe && <Star className="w-3 h-3 text-matte-black fill-current" />}
            </div>
            <span className="text-xs tracking-widest text-walnut uppercase">Save this setup as a recipe?</span>
          </label>
          
          <AnimatePresence>
            {saveAsRecipe && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Recipe Name (e.g. Morning AeroPress)"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Slider */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Overall Rating</label>
            <span className="text-sm font-medium text-walnut">{rating}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-stone-grey accent-walnut"
          />
          <div className="flex justify-between text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">
            <span>Poor</span>
            <span>Exceptional</span>
          </div>
        </div>

        {/* Taste Profile Slider */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Taste Profile</label>
            <span className={`text-sm font-medium transition-colors ${
              tasteProfile < 40 ? 'text-blue-400' : tasteProfile > 60 ? 'text-orange-400' : 'text-walnut'
            }`}>
              {getTasteLabel(tasteProfile)} ({tasteProfile})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={tasteProfile}
            onChange={(e) => setTasteProfile(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-stone-grey accent-walnut"
          />
          <div className="flex justify-between text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">
            <span>Undrinkable Sour</span>
            <span className="text-walnut/60">Balanced</span>
            <span>Undrinkable Bitter</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Tasting Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Viscosity, finish, sweetness..."
              rows={2}
              className="w-full rounded-xl border border-stone-grey bg-transparent p-4 text-sm font-light outline-none focus:border-walnut transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Improvements for next time</label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Grind finer, change temperature..."
              rows={2}
              className="w-full rounded-xl border border-stone-grey bg-transparent p-4 text-sm font-light outline-none focus:border-walnut transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-walnut py-4 text-sm font-light tracking-[0.2em] text-matte-black transition-all hover:opacity-90 disabled:opacity-50"
        >
          {showSuccess ? (
            <span className="flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 className="h-4 w-4" /> Brew Logged</span>
          ) : isSaving ? (
            "SAVING..."
          ) : (
            <>COMPLETE LOG <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/40 uppercase transition-colors hover:text-stone-grey-foreground/60"
          >
            DISCARD BREW
          </button>
        )}
      </div>
    </div>
  );
}
