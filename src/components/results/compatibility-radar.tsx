
import { useState, useEffect } from "react";

interface RadarData {
  label: string;
  value: number; // 0-100
}

interface CompatibilityRadarProps {
  data: RadarData[];
  totalScore: number;
}

export function CompatibilityRadar({ data, totalScore }: CompatibilityRadarProps) {
  const cx = 150;
  const cy = 150;
  const r = 120;
  const n = data.length;

  const [animatedScore, setAnimatedScore] = useState(0);
  const [showPolygon, setShowPolygon] = useState(false);

  useEffect(() => {
    // Animate score counter
    const duration = 1000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedScore(Math.round(totalScore * progress));
      if (progress >= 1) clearInterval(timer);
    }, 16);

    // Show polygon after short delay
    const polyTimer = setTimeout(() => setShowPolygon(true), 200);

    return () => {
      clearInterval(timer);
      clearTimeout(polyTimer);
    };
  }, [totalScore]);

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  // Background circles
  const circles = [20, 40, 60, 80, 100];

  // Data polygon points
  const points = data.map((d, i) => getPoint(i, d.value));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Axis lines
  const axisEnds = data.map((_, i) => getPoint(i, 100));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
        {/* Background circles */}
        {circles.map((pct) => (
          <circle
            key={pct}
            cx={cx}
            cy={cy}
            r={(pct / 100) * r}
            fill="none"
            stroke="rgba(203,213,225,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axisEnds.map((end, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="rgba(203,213,225,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon with animation */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="#6B21A8"
          strokeWidth="2"
          className={showPolygon ? "animate-expand-polygon" : "opacity-0"}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Gradient definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
            <stop offset="100%" stopColor="rgba(107,33,168,0.15)" />
          </radialGradient>
        </defs>

        {/* Data points with gold glow */}
        {showPolygon &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#D4AF37"
              className="animate-count-up"
              style={{
                animationDelay: `${i * 100 + 500}ms`,
                animationFillMode: "backwards",
                filter: "drop-shadow(0 0 4px rgba(212,175,55,0.5))",
              }}
            />
          ))}

        {/* Labels */}
        {data.map((d, i) => {
          const labelPoint = getPoint(i, 118);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-text-secondary"
              fontSize="10"
            >
              {d.label}
            </text>
          );
        })}

        {/* Center score */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-accent font-bold font-display"
          fontSize="32"
        >
          {animatedScore}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="fill-text-secondary"
          fontSize="11"
        >
          종합 점수
        </text>
      </svg>

      {/* Score labels as pills */}
      <div className="grid grid-cols-3 gap-2 w-full mt-3">
        {data.map((d) => (
          <div
            key={d.label}
            className="text-center glass-card !p-2 !rounded-xl"
          >
            <div className="text-[10px] text-text-secondary">{d.label}</div>
            <div className="text-sm font-bold text-accent">{d.value}점</div>
          </div>
        ))}
      </div>
    </div>
  );
}
