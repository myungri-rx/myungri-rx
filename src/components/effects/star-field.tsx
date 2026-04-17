
import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  group: number;
}

export function StarField() {
  const stars = useMemo<Star[]>(() => {
    const result: Star[] = [];
    for (let i = 0; i < 70; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        group: Math.floor(Math.random() * 3),
      });
    }
    return result;
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className={
            star.group === 0
              ? "animate-twinkle"
              : star.group === 1
                ? "animate-twinkle-slow"
                : "animate-twinkle-fast"
          }
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(248,250,252,0.9) 0%, transparent 70%)",
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
