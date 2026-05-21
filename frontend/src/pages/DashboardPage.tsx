import { useStats } from '../hooks/useStats';
import StatCards from '../components/dashboard/StatCards';
import PipelineFunnel from '../components/dashboard/PipelineFunnel';
import ActivityChart from '../components/dashboard/ActivityChart';
import SalaryChart from '../components/dashboard/SalaryChart';

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <div className="text-[#8b90a7] text-sm">Loading...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
      <StatCards stats={stats} />
      <div className="grid grid-cols-2 gap-6">
        <PipelineFunnel stats={stats} />
        <ActivityChart stats={stats} />
      </div>
      <SalaryChart stats={stats} />
    </div>
  );
}
