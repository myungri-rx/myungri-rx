"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-text-secondary/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors relative",
            activeTab === tab.id
              ? "text-accent"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}
