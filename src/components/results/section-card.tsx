"use client";

import { Card } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-lg font-bold text-accent mb-4">{title}</h3>
      {children}
    </Card>
  );
}
