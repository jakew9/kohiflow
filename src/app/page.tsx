"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";

export default function HeroPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user, loading, loginWithGoogle } = useAuth();

  return (
    <main className="relative h-screen w-full overflow-hidden bg-matte-black">
      {/* Hero Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-60"
        >
          <source src="/espresso_pull.mp4" type="video/mp4" />
          {/* Fallback for when video is not present */}
          <div className="h-full w-full bg-gradient-to-b from-stone-grey to-matte-black" />
        </video>
        <div className="absolute inset-0 bg-matte-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="mb-2 text-5xl font-extralight tracking-[0.3em] text-foreground md:text-7xl">
            KŌHĪ-FLOW
          </h1>
          <p className="mb-12 text-sm font-light tracking-widest text-walnut/80 md:text-base">
            PRECISION IN EVERY DROP
          </p>

          <div className="flex flex-col items-center gap-6">
            {loading ? (
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
            ) : user ? (
              <button
                onClick={() => setIsTransitioning(true)}
                className="group relative overflow-hidden rounded-full border border-walnut/30 px-12 py-4 text-sm tracking-[0.2em] transition-all hover:border-walnut"
              >
                <span className="relative z-10 transition-colors group-hover:text-matte-black">
                  BEGIN JOURNEY
                </span>
                <div className="absolute inset-0 z-0 translate-y-full bg-walnut transition-transform duration-300 group-hover:translate-y-0" />
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-3 rounded-full border border-walnut/30 px-8 py-4 text-xs tracking-[0.2em] text-walnut transition-all hover:bg-walnut hover:text-matte-black"
              >
                <LogIn className="h-4 w-4" /> LOGIN WITH GOOGLE
              </button>
            )}
            
            {!loading && !user && (
              <button
                onClick={() => setIsTransitioning(true)}
                className="text-[10px] tracking-[0.3em] text-stone-grey-foreground/40 uppercase hover:text-stone-grey-foreground/60 transition-colors"
              >
                Continue as Guest
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => {
               window.location.href = "/dashboard";
            }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-matte-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Coffee className="h-12 w-12 animate-pulse text-walnut" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
