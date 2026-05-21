import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ApplicationStatus, Stats } from '../../types';

const colors: Record<ApplicationStatus, string> = {
  APPLIED:   '#339af0',
  SCREENING: '#f7b731',
  INTERVIEW: '#a855f7',
  OFFER:     '#51cf66',
  REJECTED:  '#ff6b6b',
  GHOSTED:   '#6b7280',
};

export default function PipelineFunnel({ stats }: { stats: Stats }) {
  const data = (Object.entries(stats.pipeline) as [ApplicationStatus, number][]).map(([status, count]) => ({
    status,
    count,
    fill: colors[status],
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Pipeline</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={18}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="status" tick={{ fill: '#8b90a7', fontSize: 11 }} width={72} />
          <Tooltip
            cursor={{ fill: '#21253a' }}
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3248', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e8eaf0' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
