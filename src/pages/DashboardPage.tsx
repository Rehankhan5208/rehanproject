import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase, type Student, type Course, type Subject } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { FullPageLoader } from '@/components/ui/Feedback';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Feedback';
import type { Page } from '@/components/Layout';

export function DashboardPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    (async () => {
      const [s, c, sub] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*'),
      ]);
      setStudents(s.data || []);
      setCourses(c.data || []);
      setSubjects(sub.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <FullPageLoader />;

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600',
      page: 'students' as Page,
    },
    {
      label: 'Total Courses',
      value: courses.length,
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-accent-50 text-accent-600',
      page: 'courses' as Page,
    },
    {
      label: 'Total Subjects',
      value: subjects.length,
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'bg-success-50 text-success-600',
      page: 'courses' as Page,
    },
    {
      label: 'Departments',
      value: new Set(courses.map((c) => c.department)).size,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-warning-50 text-warning-600',
      page: 'courses' as Page,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-8 shadow-elevated">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome to EduAdmin</h2>
          <p className="text-primary-100 text-sm max-w-lg">
            Your complete college administration portal. Manage students, courses, subjects, attendance, and academic performance — all in one place.
          </p>
        </div>
        <div className="absolute right-4 top-4 opacity-10">
          <GraduationCap className="w-40 h-40" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => onNavigate(stat.page)}
            className="card p-5 text-left hover:shadow-cardHover transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-ink-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-3xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Recent students */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h3 className="text-lg font-semibold text-ink-900">Recently Added Students</h3>
          <button
            onClick={() => onNavigate('students')}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {students.length === 0 ? (
          <div className="px-6 py-8 text-center text-ink-500 text-sm">No students yet.</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-ink-50 transition-colors cursor-pointer"
              >
                <Avatar name={student.name} photoUrl={student.photo_url || undefined} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{student.name}</p>
                  <p className="text-xs text-ink-500 truncate">{student.email}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-ink-500">Student ID</p>
                  <p className="text-sm font-medium text-ink-700">{student.student_id}</p>
                </div>
                <Badge variant="primary">Sem {student.semester}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
