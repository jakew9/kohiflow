"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-provider";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";

interface Equipment {
  id: string;
  name: string;
  type: string;
  methods: string[];
}

interface EquipmentSelectProps {
  label: string;
  value: string;
  type: 'Machine' | 'Grinder' | 'Scale' | 'Kettle' | 'Other';
  method: string;
  onChange: (name: string) => void;
  className?: string;
}

export default function EquipmentSelect({ label, value, type, method, onChange, className = "" }: EquipmentSelectProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.uid || "anonymous";
    const equipRef = collection(db, `users/${userId}/equipment`);
    const q = query(equipRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Equipment))
        // Filter by type and method
        .filter(item => item.type === type && (item.methods.includes(method) || item.methods.includes('Other')));
      
      setItems(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, type, method]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] tracking-widest text-stone-grey-foreground/60 uppercase flex justify-between items-center">
        <span>{label}</span>
        <Link href="/equipment" className="text-walnut hover:underline flex items-center gap-1">
          <Plus className="w-2 h-2" /> MANAGE
        </Link>
      </label>
      
      {loading ? (
        <div className="h-10 w-full animate-pulse rounded border-b border-stone-grey bg-stone-grey/10" />
      ) : items.length > 0 ? (
        <div className="relative">
          <select
            value={items.find(i => i.name === value)?.id || "manual"}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === "manual") {
                onChange("");
              } else {
                const item = items.find(i => i.id === selectedId);
                if (item) onChange(item.name);
              }
            }}
            className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors appearance-none pr-8"
          >
            <option value="manual" className="bg-matte-black text-foreground">Manual Entry / Other</option>
            {items.map((item) => (
              <option key={item.id} value={item.id} className="bg-matte-black text-foreground">
                {item.name}
              </option>
            ))}
          </select>
          <Settings className="absolute right-2 top-3 h-4 w-4 text-stone-grey-foreground/40 pointer-events-none" />
          
          {(!items.find(i => i.name === value) && value !== "") && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              className="mt-2 w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
            />
          )}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="w-full border-b border-stone-grey bg-transparent py-2 text-lg font-light outline-none focus:border-walnut transition-colors"
        />
      )}
    </div>
  );
}
