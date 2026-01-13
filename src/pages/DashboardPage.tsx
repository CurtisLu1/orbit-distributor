import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { distributorApi, type Profile, type Stats } from '../api/distributor';

function Header({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Orbit 分销商后台</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">欢迎, {name}</span>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-800"
          >
            退出
          </button>
        </div>
      </div>
    </header>
  );
}

function StatsCards({ stats, commissionRate }: { stats: Stats | null; commissionRate: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">已生成</div>
        <div className="text-2xl font-bold">{stats?.total_generated || 0}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">已兑换</div>
        <div className="text-2xl font-bold text-green-600">{stats?.total_redeemed || 0}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">待结算</div>
        <div className="text-2xl font-bold text-orange-600">{stats?.pending_settlement || 0}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">佣金比例</div>
        <div className="text-2xl font-bold text-blue-600">{commissionRate}%</div>
      </div>
    </div>
  );
}

function GenerateCodesCard({ onGenerated }: { onGenerated: () => void }) {
  const [codeType, setCodeType] = useState('monthly');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await distributorApi.generateCodes(codeType, count);
      if (res.success && res.codes) {
        setCodes(res.codes);
        onGenerated();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">生成兑换码</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">类型</label>
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="monthly">月卡 (30天)</option>
            <option value="quarterly">季卡 (90天)</option>
            <option value="yearly">年卡 (365天)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">数量</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={1}
            max={100}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '生成中...' : '生成'}
        </button>
        {codes.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm max-h-40 overflow-y-auto">
            {codes.map((code) => (
              <div key={code} className="font-mono">{code}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLinksCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
      <div className="space-y-3">
        <Link
          to="/codes"
          className="block p-3 bg-gray-50 rounded hover:bg-gray-100"
        >
          查看所有兑换码
        </Link>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('distributor_token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        distributorApi.getProfile(),
        distributorApi.getStats(),
      ]);
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch {
      localStorage.removeItem('distributor_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('distributor_token');
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header name={profile?.name || ''} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto py-6 px-4">
        <StatsCards stats={stats} commissionRate={profile?.commission_rate || 0} />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenerateCodesCard onGenerated={loadData} />
          <QuickLinksCard />
        </div>
      </main>
    </div>
  );
}
