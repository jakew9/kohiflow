"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-provider";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Filter, Coffee, Droplets, Zap, MoreHorizontal, TrendingUp, BarChart2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getTasteLabel } from "@/lib/coffee-logic";

const METHOD_ICONS: Record<string, any> = {
  'Pour Over': Coffee,
  'Drip': Droplets,
  'Espresso': Zap,
  'Other': MoreHorizontal,
};

interface BrewLog {
  id: string;
  method: string;
  timestamp: string;
  coffeeWeight: number;
  tasteProfile: number;
  rating?: number;
  grinder?: string;
  grinderSetting?: string;
  brewTime?: string;
  beansUsed?: string;
  beans?: string;
  notes?: string;
  [key: string]: any;
}

function HistoryContent() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BrewLog[]>([]);
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState<'List' | 'Trends'>('List');
  const [trendsMethod, setTrendsMethod] = useState('Espresso');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.uid || "anonymous";
    const logsRef = collection(db, `users/${userId}/logs`);
    const q = query(logsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BrewLog[];
        setLogs(fetchedLogs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load brew history.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredLogs = filter === 'All' 
    ? logs 
    : logs.filter(log => log.method === filter);

  const trendsData = useMemo(() => {
    if (logs.length === 0) return null;
    
    // Filter logs by the selected method for trends
    const methodLogs = logs.filter(log => log.method === trendsMethod);
    if (methodLogs.length === 0) return null;

    // Last 10 brews for the trend line
    const recentBrews = [...methodLogs].reverse().slice(-10);
    const avgTaste = methodLogs.reduce((acc, log) => acc + (log.tasteProfile || 50), 0) / methodLogs.length;
    const avgRating = methodLogs.reduce((acc, log) => acc + (log.rating || 0), 0) / methodLogs.length;
    
    return {
      recentBrews,
      avgTaste,
      avgRating,
      totalBrews: methodLogs.length
    };
  }, [logs, trendsMethod]);

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
          BREW HISTORY
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('List')}
            className={`p-2 rounded-lg transition-colors ${view === 'List' ? 'bg-walnut/20 text-walnut' : 'text-stone-grey-foreground/40 hover:text-walnut/60'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setView('Trends')}
            className={`p-2 rounded-lg transition-colors ${view === 'Trends' ? 'bg-walnut/20 text-walnut' : 'text-stone-grey-foreground/40 hover:text-walnut/60'}`}
          >
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p className="text-sm tracking-widest uppercase">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-stone-grey-foreground/40 border border-dashed border-stone-grey rounded-3xl">
            <Droplets className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-widest uppercase">No history found</p>
            <p className="text-[10px] mt-2 max-w-xs mx-auto opacity-60 uppercase">Complete your first brew to see it here</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'List' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Filter Bar */}
                <div className="mb-12 flex flex-wrap gap-4 border-b border-stone-grey pb-8">
                  {['All', 'Pour Over', 'Drip', 'Espresso', 'Other'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-full px-6 py-2 text-[10px] tracking-widest transition-all ${
                        filter === f 
                          ? 'bg-walnut text-matte-black' 
                          : 'border border-stone-grey text-stone-grey-foreground/60 hover:border-walnut/40'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="py-20 text-center text-stone-grey-foreground/40">
                    <p className="text-sm tracking-widest uppercase">No {filter} logs found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLogs.map((log, index) => {
                      const Icon = METHOD_ICONS[log.method] || MoreHorizontal;
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group rounded-2xl border border-stone-grey bg-stone-grey/10 p-6 transition-all hover:bg-stone-grey/20"
                        >
                          <div className="mb-6 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl bg-walnut/10 p-3 text-walnut">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-light tracking-widest uppercase">{log.method}</h3>
                                <p className="text-[10px] text-stone-grey-foreground/60">
                                  {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy • h:mm a') : 'Unknown Date'}
                                </p>
                              </div>
                            </div>
                            {log.rating && (
                              <div className="text-sm font-medium text-walnut">
                                {log.rating}<span className="text-[10px] text-stone-grey-foreground/40">/10</span>
                              </div>
                            )}
                          </div>

                          <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-6">
                            <div className="space-y-1">
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Coffee</p>
                              <p className="text-sm font-light">{log.coffeeWeight}g</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">
                                Taste Profile
                              </p>
                              <p className={`text-sm font-light ${
                                log.tasteProfile < 40 ? 'text-blue-400' : log.tasteProfile > 60 ? 'text-orange-400' : 'text-walnut'
                              }`}>
                                {log.tasteProfile}% ({getTasteLabel(log.tasteProfile)})
                              </p>
                            </div>
                            {log.grinder && (
                              <div className="space-y-1">
                                <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Grinder</p>
                                <p className="text-sm font-light truncate">{log.grinder} {log.grinderSetting ? `@ ${log.grinderSetting}` : ''}</p>
                              </div>
                            )}
                            {log.brewTime && (
                              <div className="space-y-1">
                                <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Time</p>
                                <p className="text-sm font-light">{log.brewTime}</p>
                              </div>
                            )}
                          </div>

                          {(log.beansUsed || log.beans) && (
                            <div className="mb-4 space-y-1">
                              <p className="text-[8px] tracking-widest text-stone-grey-foreground/40 uppercase">Beans</p>
                              <p className="text-xs font-light line-clamp-1">{log.beansUsed || log.beans}</p>
                            </div>
                          )}

                          {log.notes && (
                            <div className="border-t border-stone-grey/30 pt-4">
                              <p className="text-[10px] font-light italic text-stone-grey-foreground/60 line-clamp-2">
                                &ldquo;{log.notes}&rdquo;
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Trends Method Filter */}
                <div className="mb-12 flex flex-wrap gap-4 border-b border-stone-grey pb-8">
                  {['Espresso', 'Pour Over', 'Drip', 'Moka Pot', 'AeroPress', 'French Press'].map((m) => {
                    const hasData = logs.some(l => l.method === m);
                    return (
                      <button
                        key={m}
                        onClick={() => setTrendsMethod(m)}
                        className={`rounded-full px-6 py-2 text-[10px] tracking-widest transition-all ${
                          trendsMethod === m 
                            ? 'bg-walnut text-matte-black' 
                            : 'border border-stone-grey text-stone-grey-foreground/60 hover:border-walnut/40'
                        } ${!hasData ? 'opacity-30' : ''}`}
                      >
                        {m.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {!trendsData ? (
                  <div className="py-20 text-center text-stone-grey-foreground/40">
                    <p className="text-sm tracking-widest uppercase">No data found for {trendsMethod}</p>
                    <p className="text-[10px] mt-2 opacity-60 uppercase">Log more brews using this method to see your trends</p>
                  </div>
                ) : (
                  <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="rounded-2xl border border-stone-grey bg-stone-grey/10 p-8 text-center">
                        <p className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/60 uppercase mb-4">Total Brews</p>
                        <p className="text-4xl font-light text-walnut">{trendsData.totalBrews}</p>
                      </div>
                      <div className="rounded-2xl border border-stone-grey bg-stone-grey/10 p-8 text-center">
                        <p className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/60 uppercase mb-4">Average Rating</p>
                        <p className="text-4xl font-light text-walnut">{trendsData.avgRating.toFixed(1)}<span className="text-sm text-stone-grey-foreground/40">/10</span></p>
                      </div>
                      <div className="rounded-2xl border border-stone-grey bg-stone-grey/10 p-8 text-center">
                        <p className="text-[10px] tracking-[0.2em] text-stone-grey-foreground/60 uppercase mb-4">Typical Profile</p>
                        <p className={`text-xl font-light tracking-widest uppercase ${
                          trendsData.avgTaste < 40 ? 'text-blue-400' : trendsData.avgTaste > 60 ? 'text-orange-400' : 'text-walnut'
                        }`}>
                          {getTasteLabel(trendsData.avgTaste)}
                        </p>
                      </div>
                    </div>

                    {/* Taste Trend Chart */}
                    <div className="rounded-2xl border border-stone-grey bg-stone-grey/10 p-8">
                      <div className="mb-12 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs tracking-[0.2em] text-walnut uppercase">Taste Migration</h3>
                          <p className="text-[10px] text-stone-grey-foreground/40 uppercase mt-1">Movement across your last 10 {trendsMethod} brews</p>
                        </div>
                        <BarChart2 className="h-5 w-5 text-walnut/40" />
                      </div>

                      <div className="relative h-64 w-full flex items-end justify-between gap-2 px-4">
                        {/* Zero Line (Balanced) */}
                        <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-walnut/20 z-0" />
                        
                        {trendsData.recentBrews.map((brew, i) => (
                          <div key={brew.id} className="relative flex-1 group flex flex-col items-center justify-end h-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(5, brew.tasteProfile)}%` }}
                              transition={{ delay: i * 0.05, duration: 1 }}
                              className={`w-full max-w-[40px] rounded-t-sm transition-colors ${
                                brew.tasteProfile < 40 ? 'bg-blue-400/40 group-hover:bg-blue-400' : 
                                brew.tasteProfile > 60 ? 'bg-orange-400/40 group-hover:bg-orange-400' : 
                                'bg-walnut/40 group-hover:bg-walnut'
                              }`}
                            />
                            <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-stone-grey-foreground/60 whitespace-nowrap uppercase">
                              {format(new Date(brew.timestamp), 'MMM d')}
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-grey p-2 rounded text-[10px] z-20 pointer-events-none">
                              <p className="text-walnut mb-0.5">{brew.method}</p>
                              <p className="text-foreground">{brew.tasteProfile}% - {getTasteLabel(brew.tasteProfile)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 flex justify-between text-[8px] tracking-[0.2em] text-stone-grey-foreground/40 uppercase border-t border-stone-grey/30 pt-4">
                        <span>Older</span>
                        <div className="flex gap-8">
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Sour</span>
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-walnut" /> Balanced</span>
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Bitter</span>
                        </div>
                        <span>Newer</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-matte-black flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" /></div>}>
      <HistoryContent />
    </Suspense>
  );
}
