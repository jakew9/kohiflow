"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/lib/toast-provider";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, X, Trash2, History, Coffee, Zap, Droplets, MoreHorizontal, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getTasteLabel } from "@/lib/coffee-logic";

const METHOD_ICONS: Record<string, any> = {
  'Pour Over': Coffee,
  'Drip': Droplets,
  'Espresso': Zap,
  'Other': MoreHorizontal,
};

interface Bean {
  id: string;
  name: string;
  roastedDate: string;
  country: string;
  isBlend: boolean;
  isFlavored: boolean;
  roastLevel: number;
  dateBought: string;
  notes: string;
}

interface BeanLog {
  id: string;
  method: string;
  timestamp: string;
  rating: number;
  tasteProfile: number;
  [key: string]: any;
}

export default function BeansPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBean, setSelectedBean] = useState<Bean | null>(null);
  const [beanLogs, setBeanLogs] = useState<BeanLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newRoastedDate, setNewRoastedDate] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [isBlend, setIsBlend] = useState(false);
  const [isFlavored, setIsFlavored] = useState(false);
  const [roastLevel, setRoastLevel] = useState(5);
  const [newDateBought, setNewDateBought] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const userId = user?.uid || "anonymous";
    const beansRef = collection(db, `users/${userId}/beans`);
    const q = query(beansRef, orderBy("dateBought", "desc"));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedBeans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bean[];
        setBeans(fetchedBeans);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load beans. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const fetchBeanLogs = async (bean: Bean) => {
    setSelectedBean(bean);
    setLoadingLogs(true);
    const userId = user?.uid || "anonymous";
    const logsRef = collection(db, `users/${userId}/logs`);
    
    // We try to find by beanId first, then by name for legacy logs
    const q1 = query(logsRef, where("beanId", "==", bean.id));
    const q2 = query(logsRef, where("beansUsed", "==", bean.name));
    
    try {
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const logs = new Map();
      
      snap1.docs.forEach(doc => logs.set(doc.id, { id: doc.id, ...doc.data() } as BeanLog));
      snap2.docs.forEach(doc => logs.set(doc.id, { id: doc.id, ...doc.data() } as BeanLog));
      
      const sortedLogs = Array.from(logs.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setBeanLogs(sortedLogs);
    } catch (err) {
      console.error("Error fetching bean logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAddBean = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;
    setIsSubmitting(true);
    setError(null);

    const userId = user?.uid || "anonymous";
    try {
      await addDoc(collection(db, `users/${userId}/beans`), {
        name: newName,
        roastedDate: newRoastedDate,
        country: newCountry,
        isBlend,
        isFlavored,
        roastLevel,
        dateBought: newDateBought,
        notes: newNotes,
        timestamp: new Date().toISOString(),
      });
      
      showToast(`${newName} added to inventory`);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowAddForm(false);
        resetForm();
      }, 800);
    } catch (error) {
      console.error("Error adding bean:", error);
      showToast("Failed to add bean", "error");
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewRoastedDate("");
    setNewCountry("");
    setIsBlend(false);
    setIsFlavored(false);
    setRoastLevel(5);
    setNewDateBought("");
    setNewNotes("");
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const userId = user?.uid || "anonymous";
    if (confirm("Delete this bean entry?")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/beans`, id));
        showToast("Bean removed");
      } catch (err) {
        showToast("Failed to delete", "error");
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
          BEAN MANAGEMENT
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-full border border-walnut/30 px-6 py-2 text-[10px] tracking-widest text-walnut transition-all hover:bg-walnut hover:text-matte-black"
        >
          <Plus className="h-3 w-3" /> ADD BEAN
        </button>
      </header>

      <main className="mx-auto max-w-5xl">
        {(loading || authLoading) ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
            <p className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/40 uppercase animate-pulse">Syncing Inventory...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p className="text-sm tracking-widest uppercase">{error}</p>
          </div>
        ) : beans.length === 0 && !showAddForm ? (
          <div className="py-20 text-center text-stone-grey-foreground/40 border border-dashed border-stone-grey rounded-3xl">
            <Coffee className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-widest uppercase">No beans in inventory</p>
            <p className="text-[10px] mt-2 max-w-xs mx-auto opacity-60 uppercase">Add your first bag of coffee to start tracking your brews</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {beans.map((bean, index) => (
              <motion.div
                key={bean.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => fetchBeanLogs(bean)}
                className="group relative cursor-pointer rounded-2xl border border-stone-grey bg-stone-grey/10 p-6 transition-all hover:bg-stone-grey/20"
              >
                <button
                  onClick={(e) => handleDelete(e, bean.id)}
                  className="absolute right-4 top-4 z-10 text-stone-grey-foreground/20 transition-colors hover:text-red-500 group-hover:opacity-100 md:opacity-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="mb-4">
                  <h3 className="text-lg font-light tracking-wide text-walnut">{bean.name}</h3>
                  <p className="text-[10px] text-stone-grey-foreground/60 uppercase tracking-widest">{bean.country}</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Roasted</p>
                    <p className="text-xs font-light">{bean.roastedDate ? format(new Date(bean.roastedDate), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Bought</p>
                    <p className="text-xs font-light">{bean.dateBought ? format(new Date(bean.dateBought), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Roast Level</p>
                    <p className="text-xs font-light">{bean.roastLevel}/10</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {bean.isBlend && <span className="rounded bg-walnut/10 px-1.5 py-0.5 text-[8px] tracking-tighter text-walnut uppercase">Blend</span>}
                    {bean.isFlavored && <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[8px] tracking-tighter text-orange-400 uppercase">Flavored</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-grey/30 pt-4">
                  <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Click to view brew history</p>
                  <History className="h-3 w-3 text-walnut/40 group-hover:text-walnut transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* View Brews Modal */}
      <AnimatePresence>
        {selectedBean && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-matte-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col rounded-2xl border border-stone-grey bg-matte-black shadow-2xl"
            >
              <div className="p-8 border-b border-stone-grey flex items-center justify-between bg-stone-grey/5">
                <div>
                  <h3 className="text-xs tracking-[0.3em] text-walnut uppercase mb-1">Brew History</h3>
                  <h2 className="text-xl font-light tracking-wide">{selectedBean.name}</h2>
                </div>
                <button onClick={() => setSelectedBean(null)} className="text-stone-grey-foreground/40 hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {loadingLogs ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
                  </div>
                ) : beanLogs.length === 0 ? (
                  <div className="py-12 text-center text-stone-grey-foreground/40">
                    <p className="text-sm tracking-widest uppercase">No brews logged with these beans yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beanLogs.map((log) => {
                      const Icon = METHOD_ICONS[log.method] || MoreHorizontal;
                      return (
                        <div key={log.id} className="group rounded-xl border border-stone-grey/30 bg-stone-grey/5 p-4 transition-all hover:bg-stone-grey/10 flex items-center gap-6">
                          <div className="rounded-lg bg-walnut/10 p-3 text-walnut shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase mb-0.5">Method</p>
                              <p className="text-[10px] font-light tracking-wider uppercase">{log.method}</p>
                            </div>
                            <div>
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase mb-0.5">Date</p>
                              <p className="text-[10px] font-light">{format(new Date(log.timestamp), 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase mb-0.5">Rating</p>
                              <p className="text-[10px] font-medium text-walnut">{log.rating}/10</p>
                            </div>
                            <div>
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase mb-0.5">Taste</p>
                              <p className={`text-[10px] font-light ${
                                log.tasteProfile < 40 ? 'text-blue-400' : log.tasteProfile > 60 ? 'text-orange-400' : 'text-walnut'
                              }`}>
                                {getTasteLabel(log.tasteProfile)}
                              </p>
                            </div>
                          </div>
                          
                          <Link 
                            href="/history" 
                            className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase hover:text-walnut transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Bean Modal */}
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
                <h3 className="text-xs tracking-[0.3em] text-walnut uppercase">Add New Bean</h3>
                <button onClick={() => setShowAddForm(false)} className="text-stone-grey-foreground/40 hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddBean} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Bean Name / Label</label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ethiopia Yirgacheffe Natural"
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Country of Origin</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Roast Level (1-10)</label>
                  <div className="flex items-center gap-4 py-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={roastLevel}
                      onChange={(e) => setRoastLevel(Number(e.target.value))}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-stone-grey accent-walnut"
                    />
                    <span className="text-sm font-medium text-walnut">{roastLevel}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Roasted Date</label>
                  <input
                    type="date"
                    value={newRoastedDate}
                    onChange={(e) => setNewRoastedDate(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Date Bought</label>
                  <input
                    type="date"
                    value={newDateBought}
                    onChange={(e) => setNewDateBought(e.target.value)}
                    className="w-full border-b border-stone-grey bg-transparent py-2 text-sm font-light outline-none focus:border-walnut transition-colors appearance-none"
                  />
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isBlend}
                      onChange={(e) => setIsBlend(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isBlend ? 'bg-walnut border-walnut' : 'border-stone-grey group-hover:border-walnut/50'}`}>
                      {isBlend && <Plus className="w-3 h-3 text-matte-black" />}
                    </div>
                    <span className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Blend</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isFlavored}
                      onChange={(e) => setIsFlavored(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isFlavored ? 'bg-walnut border-walnut' : 'border-stone-grey group-hover:border-walnut/50'}`}>
                      {isFlavored && <Plus className="w-3 h-3 text-matte-black" />}
                    </div>
                    <span className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Flavored</span>
                  </label>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase">Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
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
                      <CheckCircle2 className="w-4 h-4" /> Bean Saved
                    </motion.span>
                  ) : isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-matte-black border-t-transparent" />
                      <span>SAVING...</span>
                    </div>
                  ) : (
                    "SAVE BEAN"
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
