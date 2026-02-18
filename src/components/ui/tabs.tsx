"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="glass-card p-1.5 flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300",
            activeTab === tab.id
              ? "bg-primary/30 text-accent shadow-sm border border-primary/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
