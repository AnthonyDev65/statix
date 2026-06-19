// =====================================================
// Statix — ProbabilityChart (Vercel minimal bars)
// =====================================================
import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/formatters.utils';

interface ProbabilityChartProps {
  data: Array<{ x: number; probability: number }>;
  highlightX?: number;
  highlightRange?: [number, number];
  xLabel?: string;
  yLabel?: string;
  height?: number;
}

export function ProbabilityChart({
  data, highlightX, highlightRange,
  xLabel = 'x', yLabel = 'P(X = x)', height = 300,
}: ProbabilityChartProps) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#262626' : '#eaeaea';
  const tickColor = '#737373';
  const accent = isDark ? '#fafafa' : '#0a0a0a';
  const subtle = isDark ? '#404040' : '#d4d4d4';
  const tooltipBg = isDark ? '#0a0a0a' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#eaeaea';

  const enriched = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        isHighlight:
          (highlightX !== undefined && d.x === highlightX) ||
          (highlightRange !== undefined &&
            d.x >= highlightRange[0] &&
            d.x <= highlightRange[1]),
      })),
    [data, highlightX, highlightRange],
  );

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enriched}
          margin={{ top: 12, right: 4, left: 0, bottom: 8 }}
          barCategoryGap={2}
        >
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="x"
            stroke={tickColor}
            tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Geist Mono' }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            label={
              xLabel
                ? {
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -2,
                    fill: tickColor,
                    fontSize: 10,
                    fontFamily: 'Geist Mono',
                  }
                : undefined
            }
          />
          <YAxis
            stroke={tickColor}
            tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Geist Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v <= 0.01 ? v.toExponential(1) : v.toFixed(2))}
            width={40}
          />
          <Tooltip
            cursor={{ fill: isDark ? '#171717' : '#f5f5f5' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0].value as number;
              return (
                <div
                  style={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    fontSize: 12,
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist Mono' }}>{xLabel} =</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist Mono' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist Mono' }}>P</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist Mono' }}>
                      {formatNumber(v, 6)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="probability" radius={[2, 2, 0, 0]}>
            {enriched.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.isHighlight ? accent : subtle}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
