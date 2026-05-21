"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UnifiedEvaluation from "@/components/brew/UnifiedEvaluation";
import BeanSelect from "@/components/brew/BeanSelect";
import EquipmentSelect from "@/components/brew/EquipmentSelect";
import { ChevronLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const OTHER_METHODS = [
  "Moka Pot",
  "AeroPress",
  "French Press",
  "Percolator",
  "Hybrid Pour Over",
  "Siphon",
  "Cold Brew"
];

function OtherContent() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('recipeId');

  const [method, setMethod] = useState("");
  const [coffeeWeight, setCoffeeWeight] = useState(20);
  const [waterWeight, setWaterWeight] = useState(300);
  const [beansUsed, setBeansUsed] = useState("");
  const [beanId, setBeanId] = useState<string | undefined>();
  const [equipment, setEquipment] = useState("");
  const [grinder, setGrinder] = useState("");
  const [grinderSetting, setGrinderSetting] = useState("");
  const [brewTime, setBrewTime] = useState("04:00");
  const [showEval, setShowEval] = useState(false);
  const [isLoadedFromRecipe, setIsLoadedFromRecipe] = useState(false);

  useEffect(() => {
    if (recipeId) {
      const fetchRecipe = async () => {
        const userId = auth.currentUser?.uid || "anonymous";
        const recipeRef = doc(db, `users/${userId}/recipes`, recipeId);
        const snap = await getDoc(recipeRef);
        if (snap.exists()) {
          const data = snap.data();
          setMethod(data.method || "");
          setCoffeeWeight(data.coffeeWeight || 20);
          setWaterWeight(data.waterWeight || 300);
          setEquipment(data.equipment || "");
          setGrinder(data.grinder || "");
          setGrinderSetting(data.grinderSetting || "");
          setBrewTime(data.brewTime || "04:00");
          setIsLoadedFromRecipe(true);
        }
      };
      fetchRecipe();
    }
  }, [recipeId]);

  return (
    <div className="min-h-screen bg-matte-black p-8 text-foreground">
      <header className="mx-auto mb-12 flex max-w-4xl items-center justify-between">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-xs tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          BACK TO DASHBOARD
        </Link>
        <h2 className="text-xl font-extralight tracking-[0.2em] text-walnut uppercase">
          {method || "OTHER METHODS"}
        </h2>
        <div className="w-24" />
      </header>

      <main className="mx-auto max-w-4xl">
        {isLoadedFromRecipe && (
          <div className="mb-6 mx-auto max-w-2xl bg-walnut/10 border border-walnut/30 rounded-xl p-4 flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-walnut" />
            <p className="text-[10px] tracking-widest text-walnut uppercase">Loaded from Recipe Library</p>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!showEval ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-stone-grey bg-stone-grey/20 p-8"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-xl font-light outline-none transition-colors focus:border-walnut appearance-none"
                  >
                    <option value="" disabled className="bg-matte-black">Select Method</option>
                    {OTHER_METHODS.map(m => (
                      <option key={m} value={m} className="bg-matte-black">{m}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-full pt-4">
                  <BeanSelect 
                    value={beansUsed} 
                    onChange={(name, id) => {
                      setBeansUsed(name);
                      setBeanId(id);
                    }} 
                  />
                </div>

                <div className="space-y-2">
                  <EquipmentSelect
                    label="Brewer / Gear"
                    value={equipment}
                    type="Machine"
                    method={method || "Other"}
                    onChange={setEquipment}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Brew Time</label>
                  <input
                    type="text"
                    value={brewTime}
                    onChange={(e) => setBrewTime(e.target.value)}
                    placeholder="04:00"
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <EquipmentSelect
                    label="Grinder"
                    value={grinder}
                    type="Grinder"
                    method={method || "Other"}
                    onChange={setGrinder}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Grinder Setting</label>
                  <input
                    type="text"
                    value={grinderSetting}
                    onChange={(e) => setGrinderSetting(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Coffee (g)</label>
                  <input
                    type="number"
                    value={coffeeWeight}
                    onChange={(e) => setCoffeeWeight(Number(e.target.value))}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Water (g)</label>
                  <input
                    type="number"
                    value={waterWeight}
                    onChange={(e) => setWaterWeight(Number(e.target.value))}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => method && setShowEval(true)}
                disabled={!method}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-walnut py-4 text-sm font-light tracking-[0.2em] text-matte-black transition-all hover:opacity-90 disabled:opacity-30"
              >
                NEXT: EVALUATE <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="eval"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <UnifiedEvaluation 
                brewData={{ 
                  coffeeWeight, 
                  totalWater: waterWeight, 
                  beansUsed, 
                  beanId,
                  equipment, 
                  grinder, 
                  grinderSetting, 
                  brewTime 
                }} 
                method={method} 
                onCancel={() => setShowEval(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function OtherPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-matte-black flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" /></div>}>
      <OtherContent />
    </Suspense>
  );
}
