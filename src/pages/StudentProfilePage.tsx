import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Hash,
  BookOpen,
  Users,
  TrendingUp,
  ClipboardCheck,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import {
  supabase,
  type StudentWithCourse,
  type AttendanceWithSubject,
  type MarkWithSubject,
  type AssignmentWithSubject,
  type SubjectWithCourse,
  type Course,
  type Student,
} from '@/lib/supabase';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, Select, FormField } from '@/components/ui/Form';
import { Badge, EmptyState, LoadingSpinner, FullPageLoader } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { showToast } from '@/components/ui/toast.store';
import { formatDate, calculateGrade, getAttendanceColor } from '@/lib/utils';

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

export function StudentProfilePage({
  studentId,
  onBack,
}: {
  studentId: string;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentWithCourse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceWithSubject[]>([]);
  const [marks, setMarks] = useState<MarkWithSubject[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithSubject[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
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
    const [s, att, m, a, sub, c] = await Promise.all([
      supabase.from('students').select('*, courses(*)').eq('id', studentId).maybeSingle(),
      supabase.from('attendance').select('*, subjects(*)').eq('student_id', studentId),
      supabase.from('marks').select('*, subjects(*)').eq('student_id', studentId),
      supabase.from('assignments').select('*, subjects(*)').eq('student_id', studentId),
      supabase.from('subjects').select('*, courses(*)').order('semester'),
      supabase.from('courses').select('*').order('course_name'),
    ]);

    const stu = s.data as StudentWithCourse | null;
    setStudent(stu);
    setAttendance((att.data || []) as AttendanceWithSubject[]);
    setMarks((m.data || []) as MarkWithSubject[]);
    setAssignments((a.data || []) as AssignmentWithSubject[]);
    setSubjects((sub.data || []) as SubjectWithCourse[]);
    setCourses(c.data || []);

    if (stu) {
      setForm({
        name: stu.name,
        email: stu.email,
        phone: stu.phone,
        date_of_birth: stu.date_of_birth || '',
        gender: stu.gender,
        address: stu.address,
        photo_url: stu.photo_url,
        course_id: stu.course_id || '',
        semester: String(stu.semester),
        section: stu.section,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function handleSave() {
    if (!student) return;
    setSaving(true);
    const { error } = await supabase
      .from('students')
      .update({
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
      })
      .eq('id', student.id);
    if (error) {
      showToast('error', 'Failed to update profile');
    } else {
      showToast('success', 'Profile updated successfully');
      setEditOpen(false);
      loadData();
    }
    setSaving(false);
  }

  if (loading) return <FullPageLoader />;
  if (!student) {
    return (
      <EmptyState
        icon={<User className="w-7 h-7" />}
        title="Student not found"
        description="The student you're looking for doesn't exist."
        action={<Button onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Back to Students</Button>}
      />
    );
  }

  // Calculate overall percentage
  const totalMarks = marks.reduce(
    (sum, m) => sum + m.internal_marks + m.assignment_marks + m.exam_marks,
    0,
  );
  const maxTotal = marks.reduce((sum, m) => sum + 20 + 10 + 50, 0);
  const overallPercentage = maxTotal > 0 ? Math.round((totalMarks / maxTotal) * 100) : 0;
  const { grade, variant } = calculateGrade(overallPercentage);

  // Attendance summary
  const totalAttended = attendance.reduce((s, a) => s + a.attended_classes, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total_classes, 0);
  const attPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Student's subjects (from same course & semester)
  const studentSubjects = subjects.filter(
    (s) => s.course_id === student.course_id && s.semester === student.semester,
  );

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'attendance' as Tab, label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'marks' as Tab, label: 'Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'subjects' as Tab, label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'assignments' as Tab, label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Profile header */}
      <Card className="!p-0 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar name={student.name} photoUrl={student.photo_url || undefined} size="xl" />
            <div className="flex-1 sm:pb-2">
              <h2 className="text-2xl font-bold text-ink-900">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <Badge variant="primary">{student.courses?.course_name || 'No Course'}</Badge>
                <Badge>Semester {student.semester}</Badge>
                <Badge>Section {student.section}</Badge>
              </div>
            </div>
            <Button
              variant="secondary"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-primary-600" />
            <p className="text-xs text-ink-500 font-medium">Attendance</p>
          </div>
          <p className={`text-2xl font-bold ${getAttendanceColor(attPercentage)}`}>{attPercentage}%</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-600" />
            <p className="text-xs text-ink-500 font-medium">Overall</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{overallPercentage}%</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-success-600" />
            <p className="text-xs text-ink-500 font-medium">Grade</p>
          </div>
          <p className="text-2xl font-bold text-success-600">{grade}</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-warning-600" />
            <p className="text-xs text-ink-500 font-medium">Subjects</p>
          </div>
          <p className="text-2xl font-bold text-ink-900">{studentSubjects.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Card padding={false}>
        <div className="px-4">
          <Tabs tabs={tabs} active={activeTab} onChange={(t) => setActiveTab(t as Tab)} />
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoRow icon={<Hash className="w-4 h-4" />} label="Student ID" value={student.student_id} />
                  <InfoRow icon={<Hash className="w-4 h-4" />} label="Enrollment No." value={student.enrollment_number} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={student.email} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={student.phone || '—'} />
                  <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={formatDate(student.date_of_birth)} />
                  <InfoRow icon={<User className="w-4 h-4" />} label="Gender" value={student.gender || '—'} />
                  <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={student.address || '—'} />
                  <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Course" value={student.courses?.course_name || '—'} />
                  <InfoRow icon={<Users className="w-4 h-4" />} label="Department" value={student.courses?.department || '—'} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
                  Academic Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-ink-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-ink-700">Attendance Overview</span>
                      <span className={`text-lg font-bold ${getAttendanceColor(attPercentage)}`}>{attPercentage}%</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          attPercentage >= 85 ? 'bg-success-500' : attPercentage >= 75 ? 'bg-warning-500' : 'bg-error-500'
                        }`}
                        style={{ width: `${attPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink-500 mt-2">
                      {totalAttended} of {totalClasses} classes attended
                    </p>
                  </div>

                  <div className="rounded-lg border border-ink-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-ink-700">Academic Performance</span>
                      <span className="text-lg font-bold text-ink-900">{overallPercentage}%</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${overallPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-ink-500">Grade: <span className="font-semibold">{grade}</span></p>
                      <p className="text-xs text-ink-500">{marks.length} subjects graded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="animate-fadeIn">
              {attendance.length === 0 ? (
                <EmptyState
                  icon={<ClipboardCheck className="w-7 h-7" />}
                  title="No attendance records"
                  description="Attendance data will appear here once it's recorded for this student."
                />
              ) : (
                <div className="space-y-3">
                  {attendance.map((a) => {
                    const pct = a.total_classes > 0 ? Math.round((a.attended_classes / a.total_classes) * 100) : 0;
                    return (
                      <div key={a.id} className="flex items-center gap-4 p-4 rounded-lg border border-ink-200 hover:bg-ink-50/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">
                            {a.subjects?.subject_name || 'Unknown Subject'}
                          </p>
                          <p className="text-xs text-ink-500 mt-0.5">{a.subjects?.subject_code}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getAttendanceColor(pct)}`}>{pct}%</p>
                          <p className="text-xs text-ink-500">{a.attended_classes}/{a.total_classes} classes</p>
                        </div>
                        <div className="w-24 hidden sm:block">
                          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 85 ? 'bg-success-500' : pct >= 75 ? 'bg-warning-500' : 'bg-error-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Marks Tab */}
          {activeTab === 'marks' && (
            <div className="animate-fadeIn">
              {marks.length === 0 ? (
                <EmptyState
                  icon={<Award className="w-7 h-7" />}
                  title="No marks recorded"
                  description="Internal, assignment, and exam marks will appear here once recorded."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ink-200 bg-ink-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Subject</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Internal (20)</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Assignment (10)</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Exam (50)</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Total (80)</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">%</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m) => {
                        const total = m.internal_marks + m.assignment_marks + m.exam_marks;
                        const pct = Math.round((total / 80) * 100);
                        const g = calculateGrade(pct);
                        return (
                          <tr key={m.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-ink-900">{m.subjects?.subject_name}</p>
                              <p className="text-xs text-ink-500">{m.subjects?.subject_code}</p>
                            </td>
                            <td className="text-center px-4 py-3 text-sm text-ink-700">{m.internal_marks}</td>
                            <td className="text-center px-4 py-3 text-sm text-ink-700">{m.assignment_marks}</td>
                            <td className="text-center px-4 py-3 text-sm text-ink-700">{m.exam_marks}</td>
                            <td className="text-center px-4 py-3 text-sm font-semibold text-ink-900">{total}</td>
                            <td className="text-center px-4 py-3 text-sm font-semibold text-ink-900">{pct}%</td>
                            <td className="text-center px-4 py-3">
                              <Badge variant={g.variant}>{g.grade}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-ink-200 bg-ink-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-ink-700">Overall</td>
                        <td colSpan={3} />
                        <td className="text-center px-4 py-3 text-sm font-bold text-ink-900">{totalMarks}</td>
                        <td className="text-center px-4 py-3 text-sm font-bold text-primary-600">{overallPercentage}%</td>
                        <td className="text-center px-4 py-3">
                          <Badge variant={variant}>{grade}</Badge>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="animate-fadeIn">
              {studentSubjects.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-7 h-7" />}
                  title="No subjects found"
                  description="Subjects for this student's course and semester will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studentSubjects.map((s) => (
                    <div key={s.id} className="rounded-lg border border-ink-200 p-4 hover:shadow-cardHover transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{s.subject_name}</p>
                          <p className="text-xs text-ink-500 mt-0.5">{s.subject_code}</p>
                        </div>
                        <Badge variant="primary">{s.credits} Credits</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-500 mt-3 pt-3 border-t border-ink-100">
                        <User className="w-3.5 h-3.5" />
                        <span>{s.faculty}</span>
                        <span className="text-ink-300">|</span>
                        <span>Semester {s.semester}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="animate-fadeIn">
              {assignments.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-7 h-7" />}
                  title="No assignments"
                  description="Assignment records will appear here once they're added for this student."
                />
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => {
                    const statusIcon =
                      a.status === 'Submitted' ? <CheckCircle2 className="w-4 h-4 text-success-600" /> :
                      a.status === 'Pending' ? <Clock className="w-4 h-4 text-warning-600" /> :
                      <XCircle className="w-4 h-4 text-error-600" />;
                    const statusVariant =
                      a.status === 'Submitted' ? 'success' :
                      a.status === 'Pending' ? 'warning' : 'error';

                    return (
                      <div key={a.id} className="flex items-center gap-4 p-4 rounded-lg border border-ink-200 hover:bg-ink-50/50 transition-colors">
                        {statusIcon}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{a.title}</p>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {a.subjects?.subject_name} | Due: {formatDate(a.due_date)}
                          </p>
                        </div>
                        <Badge variant={statusVariant}>{a.status}</Badge>
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-ink-900">{a.marks_awarded}/{a.max_marks}</p>
                          <p className="text-xs text-ink-500">Marks</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Student Profile"
        subtitle={student.name}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email" required>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Phone">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-ink-50/50">
      <div className="w-8 h-8 rounded-lg bg-white border border-ink-200 flex items-center justify-center text-ink-500 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500 font-medium">{label}</p>
        <p className="text-sm text-ink-900 font-medium mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
