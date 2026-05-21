"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Coffee, Droplets, Zap, History, BookOpen, Settings, LogOut } from "lucide-react";
import { ChemexIcon, MokaPotIcon } from "@/components/ui/CustomIcons";
import { useAuth } from "@/lib/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BREW_METHODS = [
  { id: 'drip', name: 'Drip', icon: Droplets, path: '/brew/drip' },
  { id: 'pour-over', name: 'Pour Over', icon: ChemexIcon, path: '/brew/pour-over' },
  { id: 'espresso', name: 'Espresso', icon: Zap, path: '/brew/espresso' },
  { id: 'other', name: 'Other', icon: MokaPotIcon, path: '/brew/other' },
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte-black p-8 text-foreground">
      <header className="mx-auto mb-16 mt-8 flex max-w-5xl items-center justify-between">
        <button 
          onClick={logout}
          className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-stone-grey-foreground/40 transition-colors hover:text-red-400"
        >
          <LogOut className="h-4 w-4 mb-1" />
          LOGOUT
        </button>
        <h2 className="text-3xl font-extralight tracking-[0.2em] text-walnut uppercase">
          DASHBOARD
        </h2>
        <div className="flex gap-8">
          <Link 
            href="/beans"
            className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
          >
            <Coffee className="h-5 w-5 mb-1" />
            BEANS
          </Link>
          <Link 
            href="/equipment"
            className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
          >
            <Settings className="h-5 w-5 mb-1" />
            GEAR
          </Link>
          <Link 
            href="/recipes"
            className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
          >
            <BookOpen className="h-5 w-5 mb-1" />
            RECIPES
          </Link>
          <Link 
            href="/history"
            className="group flex flex-col items-center gap-1 text-[10px] tracking-widest text-stone-grey-foreground/60 transition-colors hover:text-walnut"
          >
            <History className="h-5 w-5 mb-1" />
            HISTORY
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {BREW_METHODS.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={method.path}
              className="group flex flex-col items-center justify-center rounded-2xl border border-stone-grey bg-stone-grey/30 p-12 transition-all hover:border-walnut/50 hover:bg-stone-grey/50"
            >
              <method.icon className="mb-6 h-10 w-10 text-walnut transition-transform group-hover:scale-110" />
              <span className="text-lg font-light tracking-[0.15em] uppercase">
                {method.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
