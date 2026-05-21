import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Stats } from '../../types';
import { fmtWeekLabel } from '../../lib/dates';

export default function ActivityChart({ stats }: { stats: Stats }) {
  const data = stats.activity.map((d) => ({
    week: fmtWeekLabel(d.week),
    count: d.count,
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Applications per Week</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#2e3248" strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fill: '#8b90a7', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#8b90a7', fontSize: 11 }} width={24} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3248', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e8eaf0' }}
          />
          <Line type="monotone" dataKey="count" stroke="#6c63ff" strokeWidth={2} dot={{ r: 3, fill: '#6c63ff' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
