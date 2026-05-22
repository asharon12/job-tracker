import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ApplicationStatus, Stats } from '../../types';
import { useThemeStore } from '../../store/theme.store';

const colors: Record<ApplicationStatus, string> = {
  APPLIED:           '#339af0',
  AWAITING_REFERRAL: '#f97316',
  SCREENING:         '#f7b731',
  INTERVIEW:         '#a855f7',
  OFFER:             '#51cf66',
  REJECTED:          '#ff6b6b',
  GHOSTED:           '#6b7280',
};

export default function PipelineFunnel({ stats }: { stats: Stats }) {
  const { isDark } = useThemeStore();
  const mutedColor = isDark ? '#8b90a7' : '#5b6278';
  const bgSurface = isDark ? '#1a1d27' : '#ffffff';
  const borderColor = isDark ? '#2e3248' : '#d4d4f0';
  const textColor = isDark ? '#e8eaf0' : '#111827';

  const data = (Object.entries(stats.pipeline) as [ApplicationStatus, number][]).map(([status, count]) => ({
    status,
    count,
    fill: colors[status],
  }));

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Pipeline</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={18}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="status" tick={{ fill: mutedColor, fontSize: 11 }} width={72} />
          <Tooltip
            cursor={{ fill: isDark ? '#21253a' : '#e8e8ff' }}
            contentStyle={{ background: bgSurface, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: textColor }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
