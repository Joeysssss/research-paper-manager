import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, FileText, PlusCircle, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-slate-800 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
    }`;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand and Links */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2.5 text-white font-semibold text-lg tracking-tight">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-bold text-base sm:text-lg">研究論文管理系統</span>
                <span className="text-[10px] text-slate-400 font-normal tracking-wide hidden sm:block">Research Paper Manager</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                儀表板
              </NavLink>
              <NavLink to="/papers" end className={navLinkClass}>
                <FileText className="w-4 h-4 mr-1.5" />
                論文列表
              </NavLink>
              <NavLink to="/papers/new" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 mr-1.5" />
                新增論文
              </NavLink>
            </div>
          </div>

          {/* Right User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-300 text-sm bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-slate-100">{user?.name || '研究員'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800/80 rounded-md transition-colors"
              title="登出系統"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4 mr-1" />
            儀表板
          </NavLink>
          <NavLink to="/papers" end className={navLinkClass}>
            <FileText className="w-4 h-4 mr-1" />
            論文列表
          </NavLink>
          <NavLink to="/papers/new" className={navLinkClass}>
            <PlusCircle className="w-4 h-4 mr-1" />
            新增論文
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
