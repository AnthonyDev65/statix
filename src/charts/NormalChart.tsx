// =====================================================
// Statix — DistributionChart (curva normal con el área pedida)
// =====================================================
import { useMemo } from 'react';
import {
  Area, CartesianGrid, ComposedChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/formatters.utils';
import { chartColors } from './theme';

interface DistributionChartProps {
  data: Array<{ x: number; y: number }>;
  shaded: Array<{ x: number; y: number }>;
  mu: number;
  sigma: number;
  height?: number;
}

export function DistributionChart({
  data, shaded, mu, sigma, height = 320,
}: DistributionChartProps) {
  const { isDark } = useTheme();
  const c = chartColors(isDark);
  const gridColor = c.grid;
  const tickColor = c.tick;
  const accent = c.accent;

  // El área sombreada va BAJO la curva (es la probabilidad), no un rectángulo.
  const merged = useMemo(() => {
    if (shaded.length === 0) return data.map((d) => ({ ...d, ys: null as number | null }));
    const start = shaded[0].x;
    const end = shaded[shaded.length - 1].x;
    return data.map((d) => ({ ...d, ys: d.x >= start && d.x <= end ? d.y : null }));
  }, [data, shaded]);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={merged}
          margin={{ top: 16, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke={tickColor}
            tick={{ fontSize: 13, fill: tickColor, fontFamily: 'Geist' }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{
              value: 'x',
              position: 'insideBottom',
              offset: -2,
              fill: tickColor,
              fontSize: 13,
              fontFamily: 'Geist',
            }}
          />
          <YAxis
            stroke={tickColor}
            tick={{ fontSize: 13, fill: tickColor, fontFamily: 'Geist' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(3)}
            width={44}
          />
          <ReferenceLine
            x={mu}
            stroke={accent}
            strokeWidth={1.5}
            label={{
              value: `μ = ${mu}`,
              position: 'top',
              fill: accent,
              fontSize: 13,
              fontFamily: 'Geist',
              fontWeight: 600,
            }}
          />
          <ReferenceLine
            x={mu + sigma}
            stroke={c.ref}
            strokeDasharray="2 2"
            label={{
              value: '+1σ',
              position: 'top',
              fill: tickColor,
              fontSize: 13,
              fontFamily: 'Geist',
            }}
          />
          <ReferenceLine
            x={mu - sigma}
            stroke={c.ref}
            strokeDasharray="2 2"
            label={{
              value: '-1σ',
              position: 'top',
              fill: tickColor,
              fontSize: 13,
              fontFamily: 'Geist',
            }}
          />
          <Area
            type="monotone"
            dataKey="ys"
            stroke="none"
            fill={c.area}
            fillOpacity={0.35}
            connectNulls={false}
            isAnimationActive={false}
            activeDot={false}
          />
          <Tooltip
            cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: '2 2' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as { x: number; y: number };
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
                    <span style={{ color: tickColor, fontFamily: 'Geist' }}>x =</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist' }}>
                      {formatNumber(point.x, 4)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist' }}>f(x) =</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist' }}>
                      {formatNumber(point.y, 5)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke={accent}
            strokeWidth={2.25}
            fill="none"
            dot={false}
            activeDot={{
              r: 3.5,
              fill: accent,
              stroke: c.tooltipBg,
              strokeWidth: 2,
            }}
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
