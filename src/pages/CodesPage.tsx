import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { distributorApi, type CodeInfo } from '../api/distributor';

export function CodesPage() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState<CodeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('distributor_token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCodes();
  }, [navigate]);

  const loadCodes = async () => {
    try {
      const res = await distributorApi.listCodes();
      if (res.success && res.codes) {
        setCodes(res.codes);
      }
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">兑换码列表</h1>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            返回仪表盘
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">兑换码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">天数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map((code) => (
                <tr key={code.code}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{code.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{code.code_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{code.duration_days}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.redeemed_at ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">已兑换</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">未使用</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
