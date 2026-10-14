import { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { supabase, type StudentWithCourse, type Course, type Student } from '@/lib/supabase';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select, FormField } from '@/components/ui/Form';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge, EmptyState, LoadingSpinner } from '@/components/ui/Feedback';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { showToast } from '@/components/ui/toast.store';
import { formatDate } from '@/lib/utils';

export function StudentsPage({
  onViewStudent,
}: {
  onViewStudent: (id: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    enrollment_number: '',
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    photo_url: '',
    course_id: '',
    semester: '1',
    section: 'A',
  });

  async function loadData() {
    setLoading(true);
    const [s, c] = await Promise.all([
      supabase.from('students').select('*, courses(*)').order('name'),
      supabase.from('courses').select('*').order('course_name'),
    ]);
    setStudents((s.data || []) as StudentWithCourse[]);
    setCourses(c.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollment_number.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = !courseFilter || s.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  function openAdd() {
    setEditing(null);
    setForm({
      student_id: '',
      enrollment_number: '',
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      photo_url: '',
      course_id: courses[0]?.id || '',
      semester: '1',
      section: 'A',
    });
    setFormOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setForm({
      student_id: student.student_id,
      enrollment_number: student.enrollment_number,
      name: student.name,
      email: student.email,
      phone: student.phone,
      date_of_birth: student.date_of_birth || '',
      gender: student.gender,
      address: student.address,
      photo_url: student.photo_url,
      course_id: student.course_id || '',
      semester: String(student.semester),
      section: student.section,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.student_id || !form.enrollment_number || !form.email) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    const payload = {
      student_id: form.student_id,
      enrollment_number: form.enrollment_number,
      name: form.name,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      address: form.address,
      photo_url: form.photo_url,
      course_id: form.course_id || null,
      semester: parseInt(form.semester) || 1,
      section: form.section,
    };

    if (editing) {
      const { error } = await supabase.from('students').update(payload).eq('id', editing.id);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Student ID or Enrollment Number already exists' : 'Failed to update student');
      } else {
        showToast('success', 'Student updated successfully');
        setFormOpen(false);
        loadData();
      }
    } else {
      const { error } = await supabase.from('students').insert(payload);
      if (error) {
        showToast('error', error.message.includes('duplicate') ? 'Student ID or Enrollment Number already exists' : 'Failed to add student');
      } else {
        showToast('success', 'Student added successfully');
        setFormOpen(false);
        loadData();
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('students').delete().eq('id', deleteId);
    if (error) {
      showToast('error', 'Failed to delete student');
    } else {
      showToast('success', 'Student deleted successfully');
      setDeleteId(null);
      loadData();
    }
    setDeleting(false);
  }

  const columns: Column<StudentWithCourse>[] = [
    {
      key: 'name',
      label: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.name} photoUrl={s.photo_url || undefined} size="sm" />
          <div>
            <p className="font-medium text-ink-900">{s.name}</p>
            <p className="text-xs text-ink-500">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'student_id',
      label: 'Student ID',
      render: (s) => <span className="font-mono text-xs text-ink-600">{s.student_id}</span>,
    },
    {
      key: 'enrollment_number',
      label: 'Enrollment No.',
      render: (s) => <span className="font-mono text-xs text-ink-600">{s.enrollment_number}</span>,
    },
    {
      key: 'course',
      label: 'Course',
      render: (s) => <span className="text-ink-700">{s.courses?.course_name || '—'}</span>,
    },
    {
      key: 'semester',
      label: 'Semester',
      render: (s) => <Badge variant="primary">Sem {s.semester}</Badge>,
    },
    {
      key: 'section',
      label: 'Section',
      render: (s) => <Badge>{s.section}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Students</h2>
          <p className="text-sm text-ink-500 mt-1">Manage student profiles and academic records</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
          Add Student
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-ink-500 font-medium">Total Students</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{students.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-ink-500 font-medium">Active Courses</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{courses.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-ink-500 font-medium">Showing</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{filtered.length}</p>
        </Card>
      </div>

      {/* Table card */}
      <Card padding={false}>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-ink-100">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID, enrollment, or email..." />
          </div>
          <div className="sm:w-56">
            <Select
              value={courseFilter}
              onChange={setCourseFilter}
              placeholder="All Courses"
              options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(s) => onViewStudent(s.id)}
          actions={(s) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onViewStudent(s.id)}
                className="p-2 rounded-lg text-ink-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                title="View Profile"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEdit(s)}
                className="p-2 rounded-lg text-ink-400 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(s.id)}
                className="p-2 rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          emptyState={
            <EmptyState
              icon={<Users className="w-7 h-7" />}
              title="No students found"
              description={search || courseFilter ? 'Try adjusting your search or filters.' : 'Add your first student to get started.'}
              action={!search && !courseFilter ? <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Student</Button> : undefined}
            />
          }
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Student' : 'Add New Student'}
        subtitle={editing ? 'Update student information' : 'Enter student details to create a new profile'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Save Changes' : 'Add Student'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Student ID" required>
            <input className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="STU006" />
          </FormField>
          <FormField label="Enrollment Number" required>
            <input className="input" value={form.enrollment_number} onChange={(e) => setForm({ ...form, enrollment_number: e.target.value })} placeholder="ENR2021006" />
          </FormField>
          <FormField label="Full Name" required>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
          </FormField>
          <FormField label="Email" required>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" />
          </FormField>
          <FormField label="Phone">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </FormField>
          <FormField label="Date of Birth">
            <input className="input" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </FormField>
          <FormField label="Gender">
            <Select
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v })}
              placeholder="Select gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </FormField>
          <FormField label="Photo URL">
            <input className="input" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
          </FormField>
          <FormField label="Address">
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State" />
          </FormField>
          <FormField label="Course">
            <Select
              value={form.course_id}
              onChange={(v) => setForm({ ...form, course_id: v })}
              placeholder="Select course"
              options={courses.map((c) => ({ value: c.id, label: c.course_name }))}
            />
          </FormField>
          <FormField label="Semester">
            <Select
              value={form.semester}
              onChange={(v) => setForm({ ...form, semester: v })}
              options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` }))}
            />
          </FormField>
          <FormField label="Section">
            <Select
              value={form.section}
              onChange={(v) => setForm({ ...form, section: v })}
              options={[
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
                { value: 'C', label: 'C' },
                { value: 'D', label: 'D' },
              ]}
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Student"
        message="Are you sure you want to delete this student? This will also remove all attendance, marks, and assignment records. This action cannot be undone."
      />
    </div>
  );
}
