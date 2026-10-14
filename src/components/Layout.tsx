import { type ReactNode, useState } from 'react';
import { GraduationCap, LayoutDashboard, Users, BookOpen, Menu, X, Bell, Search } from 'lucide-react';

export type Page = 'dashboard' | 'students' | 'student-profile' | 'courses';

export function Layout({
  current,
  onNavigate,
  children,
}: {
  current: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { id: Page; label: string; icon: ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses & Subjects', icon: <BookOpen className="w-5 h-5" /> },
  ];

  const pageTitle =
    current === 'dashboard'
      ? 'Dashboard'
      : current === 'students'
      ? 'Students'
      : current === 'student-profile'
      ? 'Student Profile'
      : 'Courses & Subjects';

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ink-700/50">
        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">EduAdmin</h1>
          <p className="text-ink-400 text-xs">College Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = current === item.id || (item.id === 'students' && current === 'student-profile');
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-ink-300 hover:bg-ink-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-ink-800/50">
          <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-white text-sm font-semibold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Admin User</p>
            <p className="text-ink-400 text-xs truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-ink-900 flex-shrink-0 flex-col">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-ink-900 z-50 lg:hidden animate-slideIn">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-4 p-1.5 text-ink-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-ink-200 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-ink-100 text-ink-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-ink-900">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-50 border border-ink-200 w-64">
              <Search className="w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none flex-1"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-ink-100 text-ink-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}
