import type { Stats } from '../../types';

export default function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Applications', value: stats.total, color: 'text-white' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, color: stats.responseRate >= 50 ? 'text-green-400' : 'text-yellow-400' },
    { label: 'Interviews', value: stats.pipeline.INTERVIEW, color: 'text-purple-400' },
    { label: 'Offers', value: stats.pipeline.OFFER, color: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
          <div className="text-xs text-[#8b90a7] font-medium uppercase tracking-wider mb-2">{label}</div>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}
