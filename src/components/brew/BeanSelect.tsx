"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Coffee, Plus } from "lucide-react";
import Link from "next/link";

interface Bean {
  id: string;
  name: string;
}

interface BeanSelectProps {
  value: string; // The bean name or ID
  onChange: (beanName: string, beanId?: string) => void;
  className?: string;
}

export default function BeanSelect({ value, onChange, className = "" }: BeanSelectProps) {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid || "anonymous";
    const beansRef = collection(db, `users/${userId}/beans`);
    const q = query(beansRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBeans = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name as string
      }));
      setBeans(fetchedBeans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId === "manual") {
      onChange("");
    } else {
      const selectedBean = beans.find(b => b.id === selectedId);
      if (selectedBean) {
        onChange(selectedBean.name, selectedBean.id);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase flex justify-between items-center">
        <span>Beans Used</span>
        <Link href="/beans" className="text-walnut hover:underline flex items-center gap-1">
          <Plus className="w-2 h-2" /> ADD NEW
        </Link>
      </label>
      
      {loading ? (
        <div className="h-10 w-full animate-pulse rounded border-b border-stone-grey bg-stone-grey/10" />
      ) : beans.length > 0 ? (
        <div className="relative">
          <select
            value={beans.find(b => b.name === value)?.id || "manual"}
            onChange={handleSelectChange}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors appearance-none pr-8"
          >
            <option value="manual" className="bg-matte-black text-foreground">Manual Entry / Other</option>
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id} className="bg-matte-black text-foreground">
                {bean.name}
              </option>
            ))}
          </select>
          <Coffee className="absolute right-2 top-3 h-4 w-4 text-stone-grey-foreground/40 pointer-events-none" />
          
          {/* If manual entry is selected, show an input field */}
          {(!beans.find(b => b.name === value) && value !== "") && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter bean name..."
              className="mt-2 w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          )}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Ethiopia Natural..."
          className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
        />
      )}
    </div>
  );
}
