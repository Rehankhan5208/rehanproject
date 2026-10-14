import { useState } from 'react';
import { Layout, type Page } from '@/components/Layout';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { StudentProfilePage } from '@/pages/StudentProfilePage';
import { CoursesPage } from '@/pages/CoursesPage';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  function navigate(p: Page) {
    setPage(p);
    if (p !== 'student-profile') {
      setSelectedStudentId(null);
    }
  }

  function viewStudent(id: string) {
    setSelectedStudentId(id);
    setPage('student-profile');
  }

  return (
    <>
      <Layout current={page} onNavigate={navigate}>
        {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {page === 'students' && <StudentsPage onViewStudent={viewStudent} />}
        {page === 'student-profile' && selectedStudentId && (
          <StudentProfilePage studentId={selectedStudentId} onBack={() => navigate('students')} />
        )}
        {page === 'courses' && <CoursesPage />}
      </Layout>
      <ToastContainer />
    </>
  );
}

export default App;
