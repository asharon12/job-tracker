import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Stats } from '../../types';

export default function SalaryChart({ stats }: { stats: Stats }) {
  const data = stats.salaryApps
    .filter((s) => s.min != null || s.max != null)
    .map((s, i) => ({
      index: i + 1,
      mid: s.min != null && s.max != null
        ? Math.round((s.min + s.max) / 2000)
        : Math.round(((s.min ?? s.max ?? 0)) / 1000),
    }));

  if (data.length === 0) {
    return (
      <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5 flex items-center justify-center h-[260px]">
        <p className="text-sm text-[#8b90a7]">No salary data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Salary Distribution (k)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart>
          <CartesianGrid stroke="#2e3248" strokeDasharray="3 3" />
          <XAxis dataKey="index" hide />
          <YAxis dataKey="mid" tick={{ fill: '#8b90a7', fontSize: 11 }} width={36} unit="k" />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3248', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [`${v}k`, 'Midpoint']}
          />
          <Scatter data={data} fill="#4ecdc4" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
