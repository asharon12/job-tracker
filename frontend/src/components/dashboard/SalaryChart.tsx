import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Stats } from '../../types';
import { useThemeStore } from '../../store/theme.store';

export default function SalaryChart({ stats }: { stats: Stats }) {
  const { isDark } = useThemeStore();
  const mutedColor = isDark ? '#8b90a7' : '#5b6278';
  const bgSurface = isDark ? '#1a1d27' : '#ffffff';
  const borderColor = isDark ? '#2e3248' : '#d4d4f0';
  const gridColor = isDark ? '#2e3248' : '#d4d4f0';

  const data = stats.salaryApps
    .filter((s) => s.min != null)
    .map((s, i) => ({
      index: i + 1,
      mid: Math.round((s.min ?? 0) / 1000),
    }));

  if (data.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 flex items-center justify-center h-[260px]">
        <p className="text-sm text-[var(--text-muted)]">No salary data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Salary Distribution (k)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="index" hide />
          <YAxis dataKey="mid" tick={{ fill: mutedColor, fontSize: 11 }} width={36} unit="k" />
          <Tooltip
            contentStyle={{ background: bgSurface, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [`${v}k`, 'Salary']}
          />
          <Scatter data={data} fill="#4ecdc4" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
