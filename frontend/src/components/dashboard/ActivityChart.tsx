import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Stats } from '../../types';
import { fmtWeekLabel } from '../../lib/dates';
import { useThemeStore } from '../../store/theme.store';

export default function ActivityChart({ stats }: { stats: Stats }) {
  const { isDark } = useThemeStore();
  const mutedColor = isDark ? '#8b90a7' : '#5b6278';
  const bgSurface = isDark ? '#1a1d27' : '#ffffff';
  const borderColor = isDark ? '#2e3248' : '#d4d4f0';
  const gridColor = isDark ? '#2e3248' : '#d4d4f0';
  const textColor = isDark ? '#e8eaf0' : '#111827';

  const data = stats.activity.map((d) => ({
    week: fmtWeekLabel(d.week),
    count: d.count,
  }));

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Applications per Week</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fill: mutedColor, fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: mutedColor, fontSize: 11 }} width={24} />
          <Tooltip
            contentStyle={{ background: bgSurface, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: textColor }}
          />
          <Line type="monotone" dataKey="count" stroke="#6c63ff" strokeWidth={2} dot={{ r: 3, fill: '#6c63ff' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
