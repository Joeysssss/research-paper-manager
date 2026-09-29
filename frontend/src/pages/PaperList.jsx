import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { paperAPI } from '../services/api';
import { StatusBadge, PriorityBadge, CategoryBadge, CATEGORY_MAP, STATUS_MAP, PRIORITY_MAP } from '../components/Badges';
import ConfirmModal from '../components/ConfirmModal';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  X,
  FileQuestion
} from 'lucide-react';

const CATEGORIES = [
  'Artificial Intelligence',
  'Machine Learning',
  'Explainable AI',
  'Computer Vision',
  'NLP',
  'Data Mining',
  'Other',
];

const STATUSES = ['To Read', 'Reading', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const PaperList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await paperAPI.getAll();
      setPapers(data);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError(err.message || '無法載入論文列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // Filter & Search Logic
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Search matching (Title or Authors)
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (paper.title && paper.title.toLowerCase().includes(q)) ||
        (paper.authors && paper.authors.toLowerCase().includes(q));

      // Category filter
      const matchCategory = !selectedCategory || paper.category === selectedCategory;

      // Status filter
      const matchStatus = !selectedStatus || paper.status === selectedStatus;

      // Priority filter
      const matchPriority = !selectedPriority || paper.priority === selectedPriority;

      return matchSearch && matchCategory && matchStatus && matchPriority;
    });
  }, [papers, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus || selectedPriority;

  const promptDelete = (paper) => {
    setPaperToDelete(paper);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!paperToDelete) return;
    try {
      await paperAPI.delete(paperToDelete.id);
      setSuccessMessage(`論文「${paperToDelete.title}」已成功刪除。`);
      setDeleteModalOpen(false);
      setPaperToDelete(null);
      fetchPapers();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    } catch (err) {
      setError(err.message || '刪除論文失敗');
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            研究論文列表
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            瀏覽、即時搜尋並管理您收錄的所有學術論文與文獻。
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/papers/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            新增論文
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="mt-6 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋論文標題 (Title) 或作者姓名 (Authors)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              title="清除搜尋"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              研究領域 (Category)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部領域</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_MAP[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              閱讀狀態 (Status)
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部狀態</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_MAP[st] || st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              重要程度 (Priority)
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部重要度</option>
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {PRIORITY_MAP[pr] || pr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                重設篩選條件
              </button>
            ) : (
              <div className="text-xs text-slate-400 py-2.5 text-center w-full">
                共找到 {filteredPapers.length} 篇論文
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Papers Table & Cards */}
      <div className="mt-6">
        {loading ? (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-sm text-slate-500">載入論文資料中...</p>
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      論文標題與作者
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      發表年份
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      領域分類
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      閱讀狀態
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      重要程度
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/papers/${paper.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block text-base"
                        >
                          {paper.title}
                        </Link>
                        <div className="text-xs text-slate-500 mt-1">
                          {paper.authors || '未指定作者'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {paper.year || '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <CategoryBadge category={paper.category} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={paper.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <PriorityBadge priority={paper.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex items-center space-x-1.5">
                          <Link
                            to={`/papers/${paper.id}`}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="查看詳情"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/papers/${paper.id}/edit`}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="編輯論文"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => promptDelete(paper)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="刪除論文"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50/60 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>顯示 {filteredPapers.length} / {papers.length} 篇論文</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">查無符合條件的論文</h3>
            <p className="mt-1 text-sm text-slate-500">
              請嘗試調整關鍵字搜尋或篩選條件，以尋找您收錄的論文。
            </p>
            {hasActiveFilters && (
              <div className="mt-4">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  重設所有篩選條件
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="確認刪除論文"
        message={`您確定要刪除論文「${paperToDelete?.title}」嗎？此操作將無法復原。`}
        confirmText="確認刪除"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPaperToDelete(null);
        }}
      />
    </div>
  );
};

export default PaperList;
