import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Course = {
  id: string;
  course_id: string;
  course_name: string;
  department: string;
  duration: string;
  num_semesters: number;
  created_at: string;
};

export type Subject = {
  id: string;
  subject_code: string;
  subject_name: string;
  course_id: string | null;
  semester: number;
  credits: number;
  faculty: string;
  created_at: string;
};

export type Student = {
  id: string;
  student_id: string;
  enrollment_number: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  photo_url: string;
  course_id: string | null;
  semester: number;
  section: string;
  created_at: string;
};

export type Attendance = {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  attended_classes: number;
  created_at: string;
};

export type Mark = {
  id: string;
  student_id: string;
  subject_id: string;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  created_at: string;
};

export type Assignment = {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  status: string;
  marks_awarded: number;
  max_marks: number;
  due_date: string | null;
  submitted_date: string | null;
  created_at: string;
};

export type StudentWithCourse = Student & {
  courses?: Course | null;
};

export type SubjectWithCourse = Subject & {
  courses?: Course | null;
};

export type AttendanceWithSubject = Attendance & {
  subjects?: Subject | null;
};

export type MarkWithSubject = Mark & {
  subjects?: Subject | null;
};

export type AssignmentWithSubject = Assignment & {
  subjects?: Subject | null;
};
