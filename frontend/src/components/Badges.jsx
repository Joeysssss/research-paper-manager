import React from 'react';

const STATUS_MAP = {
  'To Read': '待閱讀',
  'Reading': '閱讀中',
  'Completed': '已完成',
};

const PRIORITY_MAP = {
  'High': '高重要度',
  'Medium': '中等',
  'Low': '低',
};

const CATEGORY_MAP = {
  'Artificial Intelligence': '人工智慧 (AI)',
  'Machine Learning': '機器學習 (ML)',
  'Explainable AI': '可解釋性 AI (XAI)',
  'Computer Vision': '電腦視覺 (CV)',
  'NLP': '自然語言處理 (NLP)',
  'Data Mining': '資料探勘',
  'Other': '其他領域',
};

export const StatusBadge = ({ status }) => {
  const styles = {
    'To Read': 'bg-amber-50 text-amber-700 border-amber-200',
    'Reading': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const displayText = STATUS_MAP[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Completed' ? 'bg-emerald-500' : status === 'Reading' ? 'bg-blue-500' : 'bg-amber-500'
      }`} />
      {displayText}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    'High': 'bg-red-50 text-red-700 border-red-200 font-semibold',
    'Medium': 'bg-orange-50 text-orange-700 border-orange-200',
    'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const displayText = PRIORITY_MAP[priority] || priority;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {displayText}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const displayText = CATEGORY_MAP[category] || category;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {displayText}
    </span>
  );
};

export { STATUS_MAP, PRIORITY_MAP, CATEGORY_MAP };
