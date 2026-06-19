// =====================================================
// Statix — DistributionChart (Vercel normal curve)
// =====================================================
import { useMemo } from 'react';
import {
  Area, CartesianGrid, ComposedChart, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { formatNumber } from '@/utils/formatters.utils';

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
  const gridColor = isDark ? '#262626' : '#eaeaea';
  const tickColor = '#737373';
  const accent = isDark ? '#fafafa' : '#0a0a0a';
  const tooltipBg = isDark ? '#0a0a0a' : '#ffffff';
  const tooltipBorder = isDark ? '#404040' : '#eaeaea';

  const bounds = useMemo(() => {
    if (shaded.length === 0) return { start: 0, end: 0 };
    return { start: shaded[0].x, end: shaded[shaded.length - 1].x };
  }, [shaded]);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 12, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id="normalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.18} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke={tickColor}
            tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Geist Mono' }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{
              value: 'x',
              position: 'insideBottom',
              offset: -2,
              fill: tickColor,
              fontSize: 10,
              fontFamily: 'Geist Mono',
            }}
          />
          <YAxis
            stroke={tickColor}
            tick={{ fontSize: 11, fill: tickColor, fontFamily: 'Geist Mono' }}
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
              fontSize: 10,
              fontFamily: 'Geist Mono',
              fontWeight: 600,
            }}
          />
          <ReferenceLine
            x={mu + sigma}
            stroke={isDark ? '#404040' : '#d4d4d4'}
            strokeDasharray="2 2"
            label={{
              value: '+1σ',
              position: 'top',
              fill: tickColor,
              fontSize: 9,
              fontFamily: 'Geist Mono',
            }}
          />
          <ReferenceLine
            x={mu - sigma}
            stroke={isDark ? '#404040' : '#d4d4d4'}
            strokeDasharray="2 2"
            label={{
              value: '-1σ',
              position: 'top',
              fill: tickColor,
              fontSize: 9,
              fontFamily: 'Geist Mono',
            }}
          />
          {shaded.length > 0 && (
            <ReferenceArea
              x1={bounds.start}
              x2={bounds.end}
              fill={accent}
              fillOpacity={0.10}
              stroke="none"
            />
          )}
          <Tooltip
            cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: '2 2' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as { x: number; y: number };
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
                    <span style={{ color: tickColor, fontFamily: 'Geist Mono' }}>x =</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist Mono' }}>
                      {formatNumber(point.x, 4)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: tickColor, fontFamily: 'Geist Mono' }}>f(x) =</span>
                    <span style={{ color: accent, fontWeight: 600, fontFamily: 'Geist Mono' }}>
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
            strokeWidth={1.75}
            fill="url(#normalFill)"
            dot={false}
            activeDot={{
              r: 3.5,
              fill: accent,
              stroke: isDark ? '#000' : '#fff',
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
