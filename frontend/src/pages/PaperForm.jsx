import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paperAPI } from '../services/api';
import { CATEGORY_MAP, STATUS_MAP, PRIORITY_MAP } from '../components/Badges';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

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

const PaperForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    category: 'Machine Learning',
    status: 'To Read',
    priority: 'Medium',
    notes: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchPaper = async () => {
        try {
          const data = await paperAPI.getById(id);
          setFormData({
            title: data.title || '',
            authors: data.authors || '',
            year: data.year ? String(data.year) : '',
            category: data.category || 'Machine Learning',
            status: data.status || 'To Read',
            priority: data.priority || 'Medium',
            notes: data.notes || '',
          });
        } catch (err) {
          console.error('Error fetching paper for edit:', err);
          setError(err.message || '無法載入該篇論文資料');
        } finally {
          setLoading(false);
        }
      };

      fetchPaper();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('論文標題為必填欄位。');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year, 10) : null,
      };

      if (isEditMode) {
        await paperAPI.update(id, payload);
        navigate(`/papers/${id}`);
      } else {
        await paperAPI.create(payload);
        navigate('/papers');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
      setError(err.message || '儲存論文時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-sm text-slate-500">載入論文資料中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <Link
            to={isEditMode ? `/papers/${id}` : '/papers'}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {isEditMode ? '取消並返回論文詳情' : '返回論文列表'}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? '編輯研究論文' : '新增研究論文'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            論文標題 (Title) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="例如：Attention Is All You Need"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Authors & Year Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              作者群 (Authors)
            </label>
            <input
              type="text"
              name="authors"
              value={formData.authors}
              onChange={handleChange}
              placeholder="例如：Ashish Vaswani, Noam Shazeer, Niki Parmar..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              發表年份 (Year)
            </label>
            <input
              type="number"
              name="year"
              min="1900"
              max="2100"
              value={formData.year}
              onChange={handleChange}
              placeholder="例如：2017"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Category, Status, Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              研究領域 (Category)
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_MAP[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              閱讀狀態 (Status)
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_MAP[st] || st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              重要程度 (Priority)
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {PRIORITY_MAP[pr] || pr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            研究筆記與重點洞見 (Research Notes)
          </label>
          <textarea
            name="notes"
            rows="6"
            value={formData.notes}
            onChange={handleChange}
            placeholder="記錄方法論摘要、核心貢獻、實驗 Benchmark 數據、研究優缺點批判或未來的延伸研究發想..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            to={isEditMode ? `/papers/${id}` : '/papers'}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '儲存中...' : isEditMode ? '儲存變更' : '確認新增'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaperForm;
