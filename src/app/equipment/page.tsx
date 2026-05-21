"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/lib/toast-provider";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, X, Trash2, Settings, Coffee, Zap, Droplets, MoreHorizontal, CheckCircle2, AlertCircle } from "lucide-react";
import { ChemexIcon, MokaPotIcon } from "@/components/ui/CustomIcons";
import Link from "next/link";

const METHOD_ICONS: Record<string, any> = {
  'Pour Over': ChemexIcon,
  'Drip': Droplets,
  'Espresso': Zap,
  'Moka Pot': MokaPotIcon,
  'AeroPress': Coffee,
  'French Press': Droplets,
  'Other': MoreHorizontal,
};

const BREW_METHODS = ['Pour Over', 'Espresso', 'Drip', 'Moka Pot', 'AeroPress', 'French Press', 'Other'];

interface Equipment {
  id: string;
  name: string;
  type: 'Machine' | 'Grinder' | 'Scale' | 'Kettle' | 'Other';
  methods: string[];
  notes: string;
}

export default function EquipmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Equipment['type']>('Machine');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    // Don't start fetching until auth state is known
    if (authLoading) return;

    const userId = user?.uid || "anonymous";
    const equipRef = collection(db, `users/${userId}/equipment`);
    const q = query(equipRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Equipment[];
        setEquipment(fetched);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load equipment list.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method) 
        : [...prev, method]
    );
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;
    
    setIsSubmitting(true);
    setError(null);

    const userId = user?.uid || "anonymous";
    try {
      await addDoc(collection(db, `users/${userId}/equipment`), {
        name: newName,
        type: newType,
        methods: selectedMethods,
        notes: newNotes,
        timestamp: new Date().toISOString(),
      });
      
      showToast(`${newName} registered`);
      setShowSuccess(true);
      
      // Delay closing just long enough to show the success state
      setTimeout(() => {
        setShowSuccess(false);
        setShowAddForm(false);
        resetForm();
      }, 800);
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to register equipment", "error");
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewType('Machine');
    setSelectedMethods([]);
    setNewNotes("");
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this equipment?")) {
      const userId = user?.uid || "anonymous";
      try {
        await deleteDoc(doc(db, `users/${userId}/equipment`, id));
        showToast("Equipment removed");
      } catch (err) {
        showToast("Failed to remove", "error");
      }
    }
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
          EQUIPMENT
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-full border border-walnut/30 px-6 py-2 text-[10px] tracking-widest text-walnut transition-all hover:bg-walnut hover:text-matte-black"
        >
          <Plus className="h-3 w-3" /> ADD GEAR
        </button>
      </header>

      <main className="mx-auto max-w-5xl">
        {(loading || authLoading) ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
            <p className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/40 uppercase animate-pulse">Syncing Gear...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p className="text-sm tracking-widest uppercase">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-[10px] underline tracking-widest uppercase">Try Reloading</button>
          </div>
        ) : equipment.length === 0 && !showAddForm ? (
          <div className="py-20 text-center text-stone-grey-foreground/40 border border-dashed border-stone-grey rounded-3xl">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-widest uppercase">No gear registered</p>
            <p className="text-[10px] mt-2 max-w-xs mx-auto opacity-60 uppercase">Add your brewers, grinders, and scales to sync them with your logs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl border border-stone-grey bg-stone-grey/10 p-6 transition-all hover:bg-stone-grey/20"
              >
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute right-4 top-4 z-10 text-stone-grey-foreground/20 transition-colors hover:text-red-500 group-hover:opacity-100 md:opacity-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="mb-4">
                  <div className="text-[8px] tracking-[0.2em] text-walnut/60 uppercase mb-1">{item.type}</div>
                  <h3 className="text-lg font-light tracking-wide text-foreground">{item.name}</h3>
                </div>

                <div className="mb-4">
                  <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase mb-2">Used For</p>
                  <div className="flex flex-wrap gap-2">
                    {item.methods.length > 0 ? item.methods.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-md bg-stone-grey/20 text-[8px] tracking-wider text-stone-grey-foreground/80 uppercase border border-stone-grey/30">
                        {m}
                      </span>
                    )) : (
                      <span className="text-[8px] text-stone-grey-foreground/40 italic uppercase">Any Method</span>
                    )}
                  </div>
                </div>

                {item.notes && (
                  <div className="border-t border-stone-grey/30 pt-4 mt-4">
                    <p className="text-[10px] font-light italic text-stone-grey-foreground/60 line-clamp-2">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-matte-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-stone-grey bg-matte-black p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xs tracking-[0.3em] text-walnut uppercase">Register New Gear</h3>
                <button onClick={() => setShowAddForm(false)} className="text-stone-grey-foreground/40 hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddEquipment} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Equipment Name</label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Niche Zero, V60, Fellow Stagg..."
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors appearance-none"
                  >
                    <option value="Machine" className="bg-matte-black">Brewer / Machine</option>
                    <option value="Grinder" className="bg-matte-black">Grinder</option>
                    <option value="Scale" className="bg-matte-black">Scale</option>
                    <option value="Kettle" className="bg-matte-black">Kettle</option>
                    <option value="Other" className="bg-matte-black">Other</option>
                  </select>
                </div>

                <div className="col-span-full space-y-3">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Brew Methods</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {BREW_METHODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMethod(m)}
                        className={`px-3 py-2 rounded-lg text-[8px] tracking-widest border transition-all ${
                          selectedMethods.includes(m)
                            ? 'bg-walnut border-walnut text-matte-black font-medium'
                            : 'border-stone-grey text-stone-grey-foreground/60 hover:border-walnut/40'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
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
                  className="col-span-full mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-walnut text-sm font-light tracking-[0.2em] text-matte-black transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {showSuccess ? (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Gear Saved
                    </motion.span>
                  ) : isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-matte-black border-t-transparent" />
                      <span>SAVING...</span>
                    </div>
                  ) : (
                    "SAVE EQUIPMENT"
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
