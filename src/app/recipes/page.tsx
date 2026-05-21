"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-provider";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, Coffee, Zap, Droplets, MoreHorizontal, ArrowRight, Trash2, Plus, X, CheckCircle2 } from "lucide-react";
import { ChemexIcon, MokaPotIcon } from "@/components/ui/CustomIcons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const METHOD_ICONS: Record<string, any> = {
  'Pour Over': ChemexIcon,
  'Drip': Droplets,
  'Espresso': Zap,
  'Other': MokaPotIcon,
  'Moka Pot': MokaPotIcon,
  'AeroPress': Coffee,
  'French Press': Droplets,
};

const METHODS = ['Pour Over', 'Espresso', 'Drip', 'Moka Pot', 'AeroPress', 'French Press', 'Other'];

interface Recipe {
  id: string;
  name: string;
  method: string;
  coffeeWeight: number;
  waterWeight?: number;
  totalWater?: number;
  brewTime?: string;
  grinder?: string;
  grinderSetting?: string;
  equipment?: string;
  notes?: string;
}

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Form State
  const [newName, setNewName] = useState("");
  const [newMethod, setNewMethod] = useState("Pour Over");
  const [newCoffeeWeight, setNewCoffeeWeight] = useState(20);
  const [newWaterWeight, setNewWaterWeight] = useState(300);
  const [newGrinder, setNewGrinder] = useState("");
  const [newGrinderSetting, setNewGrinderSetting] = useState("");
  const [newBrewTime, setNewBrewTime] = useState("03:00");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    const userId = user?.uid || "anonymous";
    const recipesRef = collection(db, `users/${userId}/recipes`);
    const q = query(recipesRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setRecipes(fetchedRecipes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this recipe?")) {
      const userId = user?.uid || "anonymous";
      await deleteDoc(doc(db, `users/${userId}/recipes`, id));
    }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const userId = user?.uid || "anonymous";
    try {
      await addDoc(collection(db, `users/${userId}/recipes`), {
        name: newName,
        method: newMethod,
        coffeeWeight: newCoffeeWeight,
        waterWeight: newWaterWeight,
        grinder: newGrinder,
        grinderSetting: newGrinderSetting,
        brewTime: newBrewTime,
        notes: newNotes,
        timestamp: new Date().toISOString(),
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowAddAddModal(false);
        resetForm();
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewMethod("Pour Over");
    setNewCoffeeWeight(20);
    setNewWaterWeight(300);
    setNewGrinder("");
    setNewGrinderSetting("");
    setNewBrewTime("03:00");
    setNewNotes("");
    setIsSubmitting(false);
  };

  const handleUseRecipe = (recipe: Recipe) => {
    const methodRoutes: Record<string, string> = {
      'Pour Over': '/brew/pour-over',
      'Espresso': '/brew/espresso',
      'Drip': '/brew/drip'
    };
    
    const route = methodRoutes[recipe.method] || '/brew/other';
    router.push(`${route}?recipeId=${recipe.id}`);
  };

  return (
    <div className="min-h-screen bg-matte-black p-8 text-foreground">
      <header className="mx-auto mb-12 flex max-w-5xl items-center justify-between">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-xs tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          BACK TO DASHBOARD
        </Link>
        <h2 className="text-xl font-extralight tracking-[0.2em] text-walnut uppercase">
          RECIPE LIBRARY
        </h2>
        <button
          onClick={() => setShowAddAddModal(true)}
          className="flex items-center gap-2 rounded-full border border-walnut/30 px-6 py-2 text-[10px] tracking-widest text-walnut transition-all hover:bg-walnut hover:text-matte-black"
        >
          <Plus className="h-3 w-3" /> ADD RECIPE
        </button>
      </header>

      <main className="mx-auto max-w-5xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-20 text-center text-stone-grey-foreground/40 border border-dashed border-stone-grey rounded-3xl">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-widest uppercase">Your library is empty</p>
            <p className="text-[10px] mt-2 max-w-xs mx-auto opacity-60 uppercase">Add a custom recipe or save one after your next brew</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, index) => {
              const Icon = METHOD_ICONS[recipe.method] || MoreHorizontal;
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-2xl border border-stone-grey bg-stone-grey/10 p-6 transition-all hover:bg-stone-grey/20"
                >
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="absolute right-4 top-4 z-10 text-stone-grey-foreground/20 transition-colors hover:text-red-500 group-hover:opacity-100 md:opacity-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-walnut/10 p-3 text-walnut">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-light tracking-widest uppercase truncate max-w-[150px]">{recipe.name}</h3>
                      <p className="text-[8px] text-stone-grey-foreground/60 tracking-widest uppercase">
                        {recipe.method}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-y-4 border-t border-stone-grey/30 pt-4">
                    <div className="space-y-1">
                      <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Coffee</p>
                      <p className="text-xs font-light">{recipe.coffeeWeight}g</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Water</p>
                      <p className="text-xs font-light">{recipe.waterWeight || recipe.totalWater}g</p>
                    </div>
                    {recipe.grinderSetting && (
                      <div className="space-y-1">
                        <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Setting</p>
                        <p className="text-xs font-light truncate">{recipe.grinderSetting}</p>
                      </div>
                    )}
                    {recipe.brewTime && (
                      <div className="space-y-1">
                        <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Time</p>
                        <p className="text-xs font-light">{recipe.brewTime}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUseRecipe(recipe)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-walnut/30 py-3 text-[10px] tracking-widest text-walnut transition-all hover:bg-walnut hover:text-matte-black"
                  >
                    USE RECIPE <ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-matte-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-stone-grey bg-matte-black p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xs tracking-[0.3em] text-walnut uppercase">Create New Recipe</h3>
                <button onClick={() => setShowAddAddModal(false)} className="text-stone-grey-foreground/40 hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddRecipe} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Recipe Name</label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Afternoon V60"
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors appearance-none"
                  >
                    {METHODS.map(m => (
                      <option key={m} value={m} className="bg-matte-black">{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Brew Time</label>
                  <input
                    type="text"
                    value={newBrewTime}
                    onChange={(e) => setNewBrewTime(e.target.value)}
                    placeholder="03:00"
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Coffee (g)</label>
                  <input
                    type="number"
                    value={newCoffeeWeight}
                    onChange={(e) => setNewCoffeeWeight(Number(e.target.value))}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Water (g)</label>
                  <input
                    type="number"
                    value={newWaterWeight}
                    onChange={(e) => setNewWaterWeight(Number(e.target.value))}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Grinder</label>
                  <input
                    type="text"
                    value={newGrinder}
                    onChange={(e) => setNewGrinder(e.target.value)}
                    placeholder="Commandante, Ode..."
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Setting</label>
                  <input
                    type="text"
                    value={newGrinderSetting}
                    onChange={(e) => setNewGrinderSetting(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-stone-grey bg-transparent p-4 text-sm font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="col-span-full mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-walnut py-4 text-sm font-light tracking-[0.2em] text-matte-black transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {showSuccess ? (
                    <span className="flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Recipe Added</span>
                  ) : isSubmitting ? (
                    "ADDING..."
                  ) : (
                    "SAVE TO LIBRARY"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
