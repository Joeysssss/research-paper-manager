import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paperAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import {
  BookOpen,
  BookMarked,
  CheckCircle,
  Star,
  PlusCircle,
  ArrowRight,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    completed: 0,
    important: 0,
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await paperAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || '無法載入儀表板數據');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            研究儀表板 (Dashboard)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            歡迎回來，<span className="font-semibold text-slate-800">{user?.name}</span>。以下是您當前的文獻研讀進度與近期收錄的論文。
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link
            to="/papers/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            新增論文
          </Link>
          <Link
            to="/papers"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4 mr-2" />
            查看所有論文
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="總收錄論文 (Total Papers)"
          value={stats.total}
          icon={BookOpen}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
          description="個人研究庫收錄總數"
        />
        <StatCard
          title="閱讀中 (Reading)"
          value={stats.reading}
          icon={BookMarked}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          description="目前正深入研讀的文獻"
        />
        <StatCard
          title="已完成 (Completed)"
          value={stats.completed}
          icon={CheckCircle}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          description="已完成研讀與筆記的論文"
        />
        <StatCard
          title="重要文獻 (Important)"
          value={stats.important}
          icon={Star}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          description="高優先級的核心研究論文"
        />
      </div>

      {/* Recent Papers Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">最新收錄論文 (Recent Papers)</h2>
          </div>
          {stats.recent && stats.recent.length > 0 && (
            <Link
              to="/papers"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              查看全部 ({stats.total}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-sm text-slate-500">載入最新文獻中...</p>
          </div>
        ) : stats.recent && stats.recent.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {stats.recent.map((paper) => (
              <div
                key={paper.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <CategoryBadge category={paper.category} />
                    <StatusBadge status={paper.status} />
                    <PriorityBadge priority={paper.priority} />
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-slate-900 truncate">
                    <Link to={`/papers/${paper.id}`} className="hover:text-indigo-600 transition-colors">
                      {paper.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 truncate">
                    {paper.authors ? `${paper.authors}` : '未指定作者'}
                    {paper.year ? ` • (${paper.year} 年)` : ''}
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center">
                  <Link
                    to={`/papers/${paper.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    查看詳情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-800">尚無論文資料</h3>
            <p className="mt-1 text-xs text-slate-500">
              立即開始新增第一篇研究論文，建立您的個人化文獻庫。
            </p>
            <div className="mt-5">
              <Link
                to="/papers/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                新增第一篇論文
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
