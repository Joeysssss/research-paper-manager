import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paperAPI } from '../services/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import ConfirmModal from '../components/ConfirmModal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Users,
  FileText,
  Clock
} from 'lucide-react';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const data = await paperAPI.getById(id);
        setPaper(data);
      } catch (err) {
        console.error('Error fetching paper details:', err);
        setError(err.message || '找不到該篇論文或載入失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const confirmDelete = async () => {
    try {
      await paperAPI.delete(id);
      navigate('/papers');
    } catch (err) {
      setError(err.message || '刪除論文失敗');
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-sm text-slate-500">載入論文詳情中...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">{error || '找不到該篇論文'}</p>
          <Link
            to="/papers"
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回論文列表
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = paper.created_at
    ? new Date(paper.created_at).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '未知時間';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <Link
          to="/papers"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          返回論文列表
        </Link>
        <div className="flex items-center space-x-3">
          <Link
            to={`/papers/${paper.id}/edit`}
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4 mr-1.5 text-slate-500" />
            編輯論文
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 border border-red-200 shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            刪除
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="mt-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={paper.category} />
          <StatusBadge status={paper.status} />
          <PriorityBadge priority={paper.priority} />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          {paper.title}
        </h1>

        {/* Authors & Year Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100 text-sm">
          <div className="flex items-center space-x-3 text-slate-700">
            <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block uppercase font-medium">作者群 (Authors)</span>
              <span className="font-semibold">{paper.authors || '未指定作者'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-700">
            <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block uppercase font-medium">發表年份 (Year)</span>
              <span className="font-semibold">{paper.year ? `${paper.year} 年` : '未指定年份'}</span>
            </div>
          </div>
        </div>

        {/* Research Notes */}
        <div>
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
            <FileText className="w-5 h-5 text-slate-500" />
            <h2>研究筆記與重點摘要 (Research Notes)</h2>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {paper.notes ? paper.notes : (
              <span className="italic text-slate-400">尚未為此論文新增研究筆記。點擊「編輯論文」即可記錄您的研究洞見、方法分析或評論。</span>
            )}
          </div>
        </div>

        {/* Timestamp Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span>收錄於個人論文庫時間：{formattedDate}</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="確認刪除論文"
        message={`您確定要刪除論文「${paper?.title}」嗎？此操作將無法復原。`}
        confirmText="確認刪除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default PaperDetail;
