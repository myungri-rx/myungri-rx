"use client";

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
            stroke="rgba(203,213,225,0.1)"
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
            stroke="rgba(203,213,225,0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(107,33,168,0.3)"
          stroke="#6B21A8"
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#D4AF37" />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const labelPoint = getPoint(i, 115);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-text-secondary"
              fontSize="11"
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
          className="fill-accent font-bold"
          fontSize="28"
        >
          {totalScore}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-text-secondary"
          fontSize="11"
        >
          종합 점수
        </text>
      </svg>

      {/* Score labels */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2">
        {data.map((d) => (
          <div key={d.label} className="text-center">
            <div className="text-xs text-text-secondary">{d.label}</div>
            <div className="text-sm font-medium text-text-primary">{d.value}점</div>
          </div>
        ))}
      </div>
    </div>
  );
}
