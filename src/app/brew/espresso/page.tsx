"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EspressoForm from "@/components/brew/EspressoForm";
import UnifiedEvaluation from "@/components/brew/UnifiedEvaluation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, BookOpen } from "lucide-react";
import Link from "next/link";

function EspressoContent() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('recipeId');
  const [initialConfig, setInitialConfig] = useState<any>(null);

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (recipeId) {
      const fetchRecipe = async () => {
        const userId = auth.currentUser?.uid || "anonymous";
        const snap = await getDoc(doc(db, `users/${userId}/recipes`, recipeId));
        if (snap.exists()) {
          const data = snap.data();
          setInitialConfig({
            coffeeWeight: data.coffeeWeight || 18,
            yieldWeight: data.waterWeight || 36,
            equipment: {
              machine: data.equipment || "",
              grinder: data.grinder || "",
              setting: data.grinderSetting || "",
            }
          });
        }
      };
      fetchRecipe();
    }
  }, [recipeId]);

  const handleSaveForm = (data: any) => {
    setFormData(data);
  };

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
          ESPRESSO
        </h2>
        <div className="w-24" />
      </header>

      <main className="mx-auto max-w-4xl">
        {initialConfig && (
          <div className="mb-6 mx-auto max-w-2xl bg-walnut/10 border border-walnut/30 rounded-xl p-4 flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-walnut" />
            <p className="text-[10px] tracking-widest text-walnut uppercase">Loaded from Recipe Library</p>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!formData ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <EspressoForm onSave={handleSaveForm} isSaving={false} initialData={initialConfig} />
            </motion.div>
          ) : (
            <motion.div
              key="eval"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <UnifiedEvaluation 
                brewData={formData} 
                method="Espresso" 
                onCancel={() => setFormData(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function EspressoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-matte-black flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" /></div>}>
      <EspressoContent />
    </Suspense>
  );
}
