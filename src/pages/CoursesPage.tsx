import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, GraduationCap, Users, Layers } from 'lucide-react';
import { supabase, type Course, type SubjectWithCourse } from '@/lib/supabase';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select, FormField } from '@/components/ui/Form';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge, EmptyState } from '@/components/ui/Feedback';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/toast.store';

export function CoursesPage() {
  const [activeView, setActiveView] = useState<'courses' | 'subjects'>('courses');

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCourseFilter, setSubjectCourseFilter] = useState('');

  // Course form
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    course_id: '',
    course_name: '',
    department: '',
    duration: '',
    num_semesters: '8',
  });
  const [courseSaving, setCourseSaving] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [courseDeleting, setCourseDeleting] = useState(false);

  // Subject form
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithCourse | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    subject_code: '',
    subject_name: '',
    course_id: '',
    semester: '1',
    credits: '3',
    faculty: '',
  });
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [subjectDeleting, setSubjectDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    const [c, s] = await Promise.all([
      supabase.from('courses').select('*').order('course_name'),
      supabase.from('subjects').select('*, courses(*)').order('subject_name'),
    ]);
    setCourses(c.data || []);
    setSubjects((s.data || []) as SubjectWithCourse[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filters
  const filteredCourses = courses.filter(
    (c) =>
      !courseSearch ||
      c.course_name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.course_id.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.department.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      !subjectSearch ||
      s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.subject_code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.faculty.toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesCourse = !subjectCourseFilter || s.course_id === subjectCourseFilter;
    return matchesSearch && matchesCourse;
  });

  // Course form handlers
  function openAddCourse() {
    setEditingCourse(null);
    setCourseForm({ course_id: '', course_name: '', department: '', duration: '4 Years', num_semesters: '8' });
    setCourseFormOpen(true);
  }

  function openEditCourse(course: Course) {
    setEditingCourse(course);
    setCourseForm({
      course_id: course.course_id,
      course_name: course.course_name,
      department: course.department,
      duration: course.duration,
      num_semesters: String(course.num_semesters),
    });
    setCourseFormOpen(true);
  }

  async function handleSaveCourse() {
    if (!courseForm.course_id || !courseForm.course_name || !courseForm.department) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    setCourseSaving(true);
    const payload = {
      course_id: courseForm.course_id,
      course_name: courseForm.course_name,
      department: courseForm.department,
      duration: courseForm.duration,
      num_semesters: parseInt(courseForm.num_semesters) || 8,
    };

    if (editingCourse) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Course ID already exists' : 'Failed to update course');
      } else {
        showToast('success', 'Course updated successfully');
        setCourseFormOpen(false);
        loadData();
      }
    } else {
      const { error } = await supabase.from('courses').insert(payload);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Course ID already exists' : 'Failed to add course');
      } else {
        showToast('success', 'Course added successfully');
        setCourseFormOpen(false);
        loadData();
      }
    }
    setCourseSaving(false);
  }

  async function handleDeleteCourse() {
    if (!deleteCourseId) return;
    setCourseDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', deleteCourseId);
    if (error) {
      showToast('error', 'Failed to delete course');
    } else {
      showToast('success', 'Course deleted successfully');
      setDeleteCourseId(null);
      loadData();
    }
    setCourseDeleting(false);
  }

  // Subject form handlers
  function openAddSubject() {
    setEditingSubject(null);
    setSubjectForm({
      subject_code: '',
      subject_name: '',
      course_id: courses[0]?.id || '',
      semester: '1',
      credits: '3',
      faculty: '',
    });
    setSubjectFormOpen(true);
  }

  function openEditSubject(subject: SubjectWithCourse) {
    setEditingSubject(subject);
    setSubjectForm({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      course_id: subject.course_id || '',
      semester: String(subject.semester),
      credits: String(subject.credits),
      faculty: subject.faculty,
    });
    setSubjectFormOpen(true);
  }

  async function handleSaveSubject() {
    if (!subjectForm.subject_code || !subjectForm.subject_name || !subjectForm.course_id) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    setSubjectSaving(true);
    const payload = {
      subject_code: subjectForm.subject_code,
      subject_name: subjectForm.subject_name,
      course_id: subjectForm.course_id,
      semester: parseInt(subjectForm.semester) || 1,
      credits: parseInt(subjectForm.credits) || 3,
      faculty: subjectForm.faculty || 'TBD',
    };

    if (editingSubject) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editingSubject.id);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Subject Code already exists' : 'Failed to update subject');
      } else {
        showToast('success', 'Subject updated successfully');
        setSubjectFormOpen(false);
        loadData();
      }
    } else {
      const { error } = await supabase.from('subjects').insert(payload);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Subject Code already exists' : 'Failed to add subject');
      } else {
        showToast('success', 'Subject added successfully');
        setSubjectFormOpen(false);
        loadData();
      }
    }
    setSubjectSaving(false);
  }

  async function handleDeleteSubject() {
    if (!deleteSubjectId) return;
    setSubjectDeleting(true);
    const { error } = await supabase.from('subjects').delete().eq('id', deleteSubjectId);
    if (error) {
      showToast('error', 'Failed to delete subject');
    } else {
      showToast('success', 'Subject deleted successfully');
      setDeleteSubjectId(null);
      loadData();
    }
    setSubjectDeleting(false);
  }

  const courseColumns: Column<Course>[] = [
    {
      key: 'course_id',
      label: 'Course ID',
      render: (c) => <span className="font-mono text-xs font-semibold text-primary-600">{c.course_id}</span>,
    },
    {
      key: 'course_name',
      label: 'Course Name',
      render: (c) => <span className="font-medium text-ink-900">{c.course_name}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (c) => <span className="text-ink-600">{c.department}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (c) => <Badge>{c.duration}</Badge>,
    },
    {
      key: 'num_semesters',
      label: 'Semesters',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-ink-400" />
          <span className="text-ink-700">{c.num_semesters}</span>
        </div>
      ),
    },
    {
      key: 'subject_count',
      label: 'Subjects',
      render: (c) => {
        const count = subjects.filter((s) => s.course_id === c.id).length;
        return <Badge variant="primary">{count} subjects</Badge>;
      },
    },
  ];

  const subjectColumns: Column<SubjectWithCourse>[] = [
    {
      key: 'subject_code',
      label: 'Subject Code',
      render: (s) => <span className="font-mono text-xs font-semibold text-accent-600">{s.subject_code}</span>,
    },
    {
      key: 'subject_name',
      label: 'Subject Name',
      render: (s) => <span className="font-medium text-ink-900">{s.subject_name}</span>,
    },
    {
      key: 'course',
      label: 'Course',
      render: (s) => <span className="text-ink-600 text-sm">{s.courses?.course_name || '—'}</span>,
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (s) => <Badge variant="primary">Sem {s.semester}</Badge>,
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (s) => <span className="text-ink-700 font-medium">{s.credits}</span>,
    },
    {
      key: 'faculty',
      label: 'Faculty',
      render: (s) => <span className="text-ink-600">{s.faculty}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-ink-900">Courses & Subjects</h2>
        <p className="text-sm text-ink-500 mt-1">Manage course catalog and subject offerings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-primary-600" />
            <p className="text-xs text-ink-500 font-medium">Total Courses</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{courses.length}</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-accent-600" />
            <p className="text-xs text-ink-500 font-medium">Total Subjects</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{subjects.length}</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-success-600" />
            <p className="text-xs text-ink-500 font-medium">Departments</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{new Set(courses.map((c) => c.department)).size}</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-warning-600" />
            <p className="text-xs text-ink-500 font-medium">Total Semesters</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{courses.reduce((s, c) => s + c.num_semesters, 0)}</p>
        </Card>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'courses' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-ink-300 text-ink-600 hover:bg-ink-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Courses
        </button>
        <button
          onClick={() => setActiveView('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'subjects' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-ink-300 text-ink-600 hover:bg-ink-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subjects
        </button>
      </div>

      {/* Courses Table */}
      {activeView === 'courses' && (
        <Card padding={false} className="animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-ink-100">
            <div className="flex-1">
              <SearchInput value={courseSearch} onChange={setCourseSearch} placeholder="Search courses by name, ID, or department..." />
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddCourse}>
              Add Course
            </Button>
          </div>
          <DataTable
            columns={courseColumns}
            data={filteredCourses}
            loading={loading}
            actions={(c) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => openEditCourse(c)}
                  className="p-2 rounded-lg text-ink-400 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCourseId(c.id)}
                  className="p-2 rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            emptyState={
              <EmptyState
                icon={<GraduationCap className="w-7 h-7" />}
                title="No courses found"
                description={courseSearch ? 'Try adjusting your search.' : 'Add your first course to get started.'}
                action={!courseSearch ? <Button icon={<Plus className="w-4 h-4" />} onClick={openAddCourse}>Add Course</Button> : undefined}
              />
            }
          />
        </Card>
      )}

      {/* Subjects Table */}
      {activeView === 'subjects' && (
        <Card padding={false} className="animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-ink-100">
            <div className="flex-1">
              <SearchInput value={subjectSearch} onChange={setSubjectSearch} placeholder="Search subjects by name, code, or faculty..." />
            </div>
            <div className="sm:w-56">
              <Select
                value={subjectCourseFilter}
                onChange={setSubjectCourseFilter}
                placeholder="All Courses"
                options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
              />
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddSubject}>
              Add Subject
            </Button>
          </div>
          <DataTable
            columns={subjectColumns}
            data={filteredSubjects}
            loading={loading}
            actions={(s) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => openEditSubject(s)}
                  className="p-2 rounded-lg text-ink-400 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteSubjectId(s.id)}
                  className="p-2 rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            emptyState={
              <EmptyState
                icon={<BookOpen className="w-7 h-7" />}
                title="No subjects found"
                description={subjectSearch || subjectCourseFilter ? 'Try adjusting your search or filters.' : 'Add your first subject to get started.'}
                action={!subjectSearch && !subjectCourseFilter ? <Button icon={<Plus className="w-4 h-4" />} onClick={openAddSubject}>Add Subject</Button> : undefined}
              />
            }
          />
        </Card>
      )}

      {/* Course Modal */}
      <Modal
        open={courseFormOpen}
        onClose={() => setCourseFormOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        subtitle={editingCourse ? 'Update course information' : 'Create a new course in the catalog'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCourseFormOpen(false)} disabled={courseSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourse} loading={courseSaving}>
              {editingCourse ? 'Save Changes' : 'Add Course'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Course ID" required>
            <input className="input" value={courseForm.course_id} onChange={(e) => setCourseForm({ ...courseForm, course_id: e.target.value })} placeholder="CSE102" />
          </FormField>
          <FormField label="Course Name" required>
            <input className="input" value={courseForm.course_name} onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} placeholder="B.Tech Information Technology" />
          </FormField>
          <FormField label="Department" required>
            <input className="input" value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} placeholder="Information Technology" />
          </FormField>
          <FormField label="Duration">
            <input className="input" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="4 Years" />
          </FormField>
          <FormField label="Number of Semesters">
            <Select
              value={courseForm.num_semesters}
              onChange={(v) => setCourseForm({ ...courseForm, num_semesters: v })}
              options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            />
          </FormField>
        </div>
      </Modal>

      {/* Subject Modal */}
      <Modal
        open={subjectFormOpen}
        onClose={() => setSubjectFormOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        subtitle={editingSubject ? 'Update subject information' : 'Create a new subject offering'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubjectFormOpen(false)} disabled={subjectSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubject} loading={subjectSaving}>
              {editingSubject ? 'Save Changes' : 'Add Subject'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Subject Code" required>
            <input className="input" value={subjectForm.subject_code} onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value })} placeholder="CS401" />
          </FormField>
          <FormField label="Subject Name" required>
            <input className="input" value={subjectForm.subject_name} onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value })} placeholder="Machine Learning" />
          </FormField>
          <FormField label="Course" required>
            <Select
              value={subjectForm.course_id}
              onChange={(v) => setSubjectForm({ ...subjectForm, course_id: v })}
              placeholder="Select course"
              options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
            />
          </FormField>
          <FormField label="Semester">
            <Select
              value={subjectForm.semester}
              onChange={(v) => setSubjectForm({ ...subjectForm, semester: v })}
              options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` }))}
            />
          </FormField>
          <FormField label="Credits">
            <Select
              value={subjectForm.credits}
              onChange={(v) => setSubjectForm({ ...subjectForm, credits: v })}
              options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} Credits` }))}
            />
          </FormField>
          <FormField label="Faculty">
            <input className="input" value={subjectForm.faculty} onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })} placeholder="Dr. John Smith" />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        loading={courseDeleting}
        title="Delete Course"
        message="Deleting this course will also remove all subjects linked to it. This action cannot be undone."
      />

      <ConfirmDialog
        open={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        onConfirm={handleDeleteSubject}
        loading={subjectDeleting}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
      />
    </div>
  );
}
