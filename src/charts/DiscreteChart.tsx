// =====================================================
// Statix — ProbabilityChart (barras; el valor pedido en color de acento)
// =====================================================
import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/formatters.utils';
import { chartColors } from './theme';

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
  const c = chartColors(isDark);
  const gridColor = c.grid;
  const tickColor = c.tick;
  const accent = c.accent;
  const subtle = c.subtle;

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
            tick={{ fontSize: 13, fill: tickColor, fontFamily: 'Geist' }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            label={
              xLabel
                ? {
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -2,
                    fill: tickColor,
                    fontSize: 13,
                    fontFamily: 'Geist',
                  }
                : undefined
            }
          />
          <YAxis
            stroke={tickColor}
            tick={{ fontSize: 13, fill: tickColor, fontFamily: 'Geist' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v === 0 ? "0" : v <= 0.01 ? v.toExponential(1) : v.toFixed(2))}
            width={40}
          />
          <Tooltip
            cursor={{ fill: c.cursor }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0].value as number;
              return (
                <div
                  style={{
                    background: c.tooltipBg,
                    color: c.tooltipText,
                    borderRadius: 8,
                    fontSize: 13,
                    padding: '8px 12px',
                    boxShadow: c.tooltipShadow,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist' }}>{xLabel} =</span>
                    <span style={{ color: c.tooltipText, fontWeight: 600 }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist' }}>{yLabel}</span>
                    <span style={{ color: c.tooltipText, fontWeight: 600 }}>
                      {formatNumber(v, 6)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
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
