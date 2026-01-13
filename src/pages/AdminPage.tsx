import { useState, useEffect } from 'react';
import { adminApi, type DistributorWithStats } from '../api/admin';

interface AdminLoginProps {
  adminKey: string;
  setAdminKey: (key: string) => void;
  onAuth: () => void;
  loading: boolean;
}

function AdminLogin({ adminKey, setAdminKey, onAuth, loading }: AdminLoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">管理员登录</h1>
        <div className="space-y-4">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="输入管理员密钥"
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            onClick={onAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '验证中...' : '登录'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  adminKey: string;
  distributors: DistributorWithStats[];
  onRefresh: () => void;
}

interface TableProps {
  distributors: DistributorWithStats[];
  adminKey: string;
  onRefresh: () => void;
}

function DistributorTable({ distributors, adminKey, onRefresh }: TableProps) {
  const toggleStatus = async (id: string, current: boolean) => {
    await adminApi.updateStatus(adminKey, id, !current);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">前缀</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">生成/兑换</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {distributors.map((d) => (
            <tr key={d.id}>
              <td className="px-6 py-4 text-sm">{d.name}</td>
              <td className="px-6 py-4 text-sm">{d.email}</td>
              <td className="px-6 py-4 text-sm font-mono">{d.code_prefix || '-'}</td>
              <td className="px-6 py-4 text-sm">{d.commission_rate}%</td>
              <td className="px-6 py-4 text-sm">{d.total_generated}/{d.total_redeemed}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {d.is_active ? '启用' : '禁用'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => toggleStatus(d.id, d.is_active)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {d.is_active ? '禁用' : '启用'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ModalProps {
  adminKey: string;
  onClose: () => void;
  onCreated: () => void;
}

function CreateDistributorModal({ adminKey, onClose, onCreated }: ModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rate, setRate] = useState(70);
  const [codePrefix, setCodePrefix] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminApi.createDistributor(adminKey, {
        name, email, password, commission_rate: rate, code_prefix: codePrefix || undefined
      });
      if (res.success) onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">添加分销商</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名称"
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full border rounded px-3 py-2"
            required
          />
          <div>
            <label className="block text-sm text-gray-600 mb-1">兑换码前缀 (可选)</label>
            <input
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              placeholder="如: BN, ADMIN"
              className="w-full border rounded px-3 py-2 font-mono"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">佣金比例 (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              placeholder="佣金比例"
              className="w-full border rounded px-3 py-2"
              min={0}
              max={100}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded">
              取消
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded">
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GenerateCodesModalProps {
  adminKey: string;
  onClose: () => void;
}

function GenerateCodesModal({ adminKey, onClose }: GenerateCodesModalProps) {
  const [codeType, setCodeType] = useState('monthly');
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await adminApi.generateCodes(adminKey, codeType, count, prefix || undefined);
      if (res.success) {
        setCodes(res.codes || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    const text = codes.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">批量生成兑换码</h2>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">会员类型</label>
            <select
              value={codeType}
              onChange={(e) => setCodeType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="monthly">月度会员</option>
              <option value="quarterly">季度会员</option>
              <option value="yearly">年度会员</option>
              <option value="lifetime">终身会员</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">兑换码前缀 (可选)</label>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="如: ADMIN, PROMO"
              className="w-full border rounded px-3 py-2 font-mono"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">生成数量</label>
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
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成兑换码'}
          </button>
        </div>

        {codes.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">已生成 {codes.length} 个兑换码</span>
              <button
                onClick={handleCopyAll}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                {copied ? '已复制!' : '复制全部'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 font-mono text-sm">
              {codes.map((code, i) => (
                <div key={i} className="py-1 border-b border-gray-200 last:border-0">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border py-2 rounded hover:bg-gray-50"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

interface BatchHistoryModalProps {
  adminKey: string;
  onClose: () => void;
}

interface Batch {
  batch_id: string;
  type: string;
  total_count: number;
  redeemed_count: number;
  created_at: string;
}

interface Code {
  id: string;
  code: string;
  type: string;
  redeemedAt: string | null;
}

function BatchHistoryModal({ adminKey, onClose }: BatchHistoryModalProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listBatches(adminKey);
      if (res.success) {
        setBatches(res.batches || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCodes = async (batchId: string) => {
    setCodesLoading(true);
    setSelectedBatch(batchId);
    try {
      const res = await adminApi.getBatchCodes(adminKey, batchId);
      if (res.success) {
        setCodes(res.codes || []);
      }
    } finally {
      setCodesLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    monthly: '月度',
    quarterly: '季度',
    yearly: '年度',
    lifetime: '终身',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">批次历史</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无批次记录</div>
        ) : (
          <div className="flex-1 overflow-hidden flex gap-4">
            <div className="w-1/2 overflow-y-auto">
              <div className="space-y-2">
                {batches.map((batch) => (
                  <div
                    key={batch.batch_id}
                    onClick={() => loadCodes(batch.batch_id)}
                    className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                      selectedBatch === batch.batch_id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{typeLabels[batch.type] || batch.type}会员</span>
                      <span className="text-sm text-gray-500">
                        {batch.redeemed_count}/{batch.total_count} 已兑换
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(batch.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-1/2 overflow-y-auto bg-gray-50 rounded p-3">
              {!selectedBatch ? (
                <div className="text-center text-gray-500 py-8">选择批次查看兑换码</div>
              ) : codesLoading ? (
                <div className="text-center text-gray-500 py-8">加载中...</div>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {codes.map((code) => (
                    <div
                      key={code.id}
                      className={`py-1 px-2 rounded ${code.redeemedAt ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      {code.code}
                      {code.redeemedAt && <span className="ml-2 text-xs">(已兑换)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border py-2 rounded hover:bg-gray-50"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

interface DistributorStatsModalProps {
  adminKey: string;
  onClose: () => void;
}

interface DistributorStat {
  id: string;
  name: string;
  code_prefix: string | null;
  total_generated: number;
  total_redeemed: number;
  pending_settlement: number;
}

function DistributorStatsModal({ adminKey, onClose }: DistributorStatsModalProps) {
  const [period, setPeriod] = useState('this_month');
  const [stats, setStats] = useState<DistributorStat[]>([]);
  const [loading, setLoading] = useState(false);

  const getDateRange = (p: string) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (p) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_quarter':
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        end = new Date(now.getFullYear(), q * 3 + 3, 1);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(period);
      const res = await adminApi.getDistributorsStats(adminKey, start, end);
      if (res.success) {
        setStats(res.stats || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const periodLabels: Record<string, string> = {
    this_month: '本月',
    last_month: '上月',
    this_quarter: '本季度',
    this_year: '本年',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">分销商统计</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-3 py-1"
          >
            {Object.entries(periodLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">分销商</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">前缀</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">生成</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">已兑换</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">待结算</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">兑换率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-sm">{s.name}</td>
                    <td className="px-4 py-2 text-sm font-mono">{s.code_prefix || '-'}</td>
                    <td className="px-4 py-2 text-sm text-right">{s.total_generated}</td>
                    <td className="px-4 py-2 text-sm text-right">{s.total_redeemed}</td>
                    <td className="px-4 py-2 text-sm text-right">{s.pending_settlement}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {s.total_generated > 0
                        ? `${((s.total_redeemed / s.total_generated) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border py-2 rounded hover:bg-gray-50"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ adminKey, distributors, onRefresh }: AdminDashboardProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showBatches, setShowBatches] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Orbit 管理后台</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              分销统计
            </button>
            <button
              onClick={() => setShowBatches(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              批次历史
            </button>
            <button
              onClick={() => setShowGenerate(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              生成兑换码
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              添加分销商
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <DistributorTable
          distributors={distributors}
          adminKey={adminKey}
          onRefresh={onRefresh}
        />
      </main>

      {showCreate && (
        <CreateDistributorModal
          adminKey={adminKey}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); onRefresh(); }}
        />
      )}

      {showGenerate && (
        <GenerateCodesModal
          adminKey={adminKey}
          onClose={() => setShowGenerate(false)}
        />
      )}

      {showBatches && (
        <BatchHistoryModal
          adminKey={adminKey}
          onClose={() => setShowBatches(false)}
        />
      )}

      {showStats && (
        <DistributorStatsModal
          adminKey={adminKey}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}

export function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [distributors, setDistributors] = useState<DistributorWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listDistributors(adminKey);
      if (res.success) {
        setDistributors(res.distributors || []);
        setAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return <AdminLogin adminKey={adminKey} setAdminKey={setAdminKey} onAuth={handleAuth} loading={loading} />;
  }

  return (
    <AdminDashboard
      adminKey={adminKey}
      distributors={distributors}
      onRefresh={handleAuth}
    />
  );
}
