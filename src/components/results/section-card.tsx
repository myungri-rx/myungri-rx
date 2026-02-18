"use client";

import { Card } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  isVisible?: boolean;
  delay?: number;
}

export function SectionCard({
  title,
  children,
  isVisible = true,
  delay = 0,
}: SectionCardProps) {
  if (!isVisible) return null;

  return (
    <Card
      variant="elevated"
      className="animate-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "backwards",
      }}
    >
      <h3 className="font-display text-lg font-bold text-gradient-gold mb-3">
        {title}
      </h3>
      <div
        className="h-px mb-4 animate-reveal-line"
        style={{
          background:
            "linear-gradient(90deg, rgba(212,175,55,0.5), transparent)",
          animationDelay: `${delay + 200}ms`,
          animationFillMode: "backwards",
        }}
      />
      {children}
    </Card>
  );
}
