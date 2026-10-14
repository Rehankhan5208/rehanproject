/*
# College Administration Schema

1. New Tables
- `courses`: Course catalog (Course ID, name, department, duration, semesters)
- `subjects`: Subjects linked to courses (code, name, course, semester, credits, faculty)
- `students`: Student profiles (photo, enrollment, name, contact, DOB, gender, address, course, semester, section)
- `attendance`: Per-subject attendance records for students
- `marks`: Internal, assignment, and exam marks per subject per student
- `assignments`: Assignment records per subject per student

2. Relationships
- subjects.course_id → courses.id (CASCADE)
- students.course_id → courses.id (SET NULL)
- attendance/marks/assignments → students.id (CASCADE) and subjects.id (CASCADE)

3. Security
- Single-tenant app (no auth). RLS enabled on all tables.
- anon + authenticated have full CRUD on all tables (intentionally public/shared data).
*/

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL UNIQUE,
  course_name text NOT NULL,
  department text NOT NULL,
  duration text NOT NULL,
  num_semesters int NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text NOT NULL UNIQUE,
  subject_name text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  semester int NOT NULL,
  credits int NOT NULL DEFAULT 3,
  faculty text NOT NULL DEFAULT 'TBD',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL UNIQUE,
  enrollment_number text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '',
  address text DEFAULT '',
  photo_url text DEFAULT '',
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  semester int NOT NULL DEFAULT 1,
  section text DEFAULT 'A',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  total_classes int NOT NULL DEFAULT 0,
  attended_classes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

-- Marks
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  internal_marks int NOT NULL DEFAULT 0,
  assignment_marks int NOT NULL DEFAULT 0,
  exam_marks int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_marks" ON marks;
CREATE POLICY "anon_select_marks" ON marks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_marks" ON marks;
CREATE POLICY "anon_insert_marks" ON marks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_marks" ON marks;
CREATE POLICY "anon_update_marks" ON marks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_marks" ON marks;
CREATE POLICY "anon_delete_marks" ON marks FOR DELETE TO anon, authenticated USING (true);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  marks_awarded int DEFAULT 0,
  max_marks int NOT NULL DEFAULT 100,
  due_date date,
  submitted_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assignments" ON assignments;
CREATE POLICY "anon_select_assignments" ON assignments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assignments" ON assignments;
CREATE POLICY "anon_insert_assignments" ON assignments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assignments" ON assignments;
CREATE POLICY "anon_update_assignments" ON assignments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assignments" ON assignments;
CREATE POLICY "anon_delete_assignments" ON assignments FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON assignments(subject_id);

-- Seed: courses
INSERT INTO courses (course_id, course_name, department, duration, num_semesters) VALUES
  ('CSE101', 'B.Tech Computer Science', 'Computer Science & Engineering', '4 Years', 8),
  ('ECE101', 'B.Tech Electronics & Communication', 'Electronics & Communication', '4 Years', 8),
  ('MEC101', 'B.Tech Mechanical Engineering', 'Mechanical Engineering', '4 Years', 8),
  ('BBA101', 'Bachelor of Business Administration', 'Business Administration', '3 Years', 6)
ON CONFLICT DO NOTHING;

-- Seed: subjects
INSERT INTO subjects (subject_code, subject_name, course_id, semester, credits, faculty) VALUES
  ('CS201', 'Data Structures & Algorithms', (SELECT id FROM courses WHERE course_id='CSE101'), 3, 4, 'Dr. Rajesh Kumar'),
  ('CS202', 'Database Management Systems', (SELECT id FROM courses WHERE course_id='CSE101'), 3, 4, 'Dr. Priya Sharma'),
  ('CS203', 'Computer Networks', (SELECT id FROM courses WHERE course_id='CSE101'), 3, 3, 'Prof. Amit Singh'),
  ('CS301', 'Operating Systems', (SELECT id FROM courses WHERE course_id='CSE101'), 4, 4, 'Dr. Sunita Verma'),
  ('EC201', 'Digital Signal Processing', (SELECT id FROM courses WHERE course_id='ECE101'), 3, 4, 'Dr. Manoj Gupta'),
  ('EC202', 'Microprocessors', (SELECT id FROM courses WHERE course_id='ECE101'), 3, 3, 'Prof. Kavita Rao'),
  ('ME201', 'Thermodynamics', (SELECT id FROM courses WHERE course_id='MEC101'), 3, 4, 'Dr. Anil Joshi'),
  ('BB201', 'Principles of Management', (SELECT id FROM courses WHERE course_id='BBA101'), 2, 3, 'Dr. Neha Kapoor')
ON CONFLICT DO NOTHING;

-- Seed: students
INSERT INTO students (student_id, enrollment_number, name, email, phone, date_of_birth, gender, address, photo_url, course_id, semester, section) VALUES
  ('STU001', 'ENR2021001', 'Aarav Patel', 'aarav.patel@college.edu', '+91 98765 43210', '2003-05-15', 'Male', '12 MG Road, Bangalore, KA', '', (SELECT id FROM courses WHERE course_id='CSE101'), 3, 'A'),
  ('STU002', 'ENR2021002', 'Diya Sharma', 'diya.sharma@college.edu', '+91 98765 43211', '2003-08-22', 'Female', '45 Park Street, Kolkata, WB', '', (SELECT id FROM courses WHERE course_id='CSE101'), 3, 'A'),
  ('STU003', 'ENR2021003', 'Arjun Nair', 'arjun.nair@college.edu', '+91 98765 43212', '2003-01-10', 'Male', '78 Marine Drive, Mumbai, MH', '', (SELECT id FROM courses WHERE course_id='CSE101'), 4, 'B'),
  ('STU004', 'ENR2021004', 'Ananya Reddy', 'ananya.reddy@college.edu', '+91 98765 43213', '2003-03-18', 'Female', '23 Banjara Hills, Hyderabad, TS', '', (SELECT id FROM courses WHERE course_id='ECE101'), 3, 'A'),
  ('STU005', 'ENR2021005', 'Vikram Singh', 'vikram.singh@college.edu', '+91 98765 43214', '2003-07-05', 'Male', '56 Civil Lines, Delhi, DL', '', (SELECT id FROM courses WHERE course_id='MEC101'), 3, 'C')
ON CONFLICT DO NOTHING;

-- Seed: attendance for student 1
INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes)
SELECT s.id, sub.id, 
  CASE sub.subject_code WHEN 'CS201' THEN 40 WHEN 'CS202' THEN 38 WHEN 'CS203' THEN 35 ELSE 30 END,
  CASE sub.subject_code WHEN 'CS201' THEN 36 WHEN 'CS202' THEN 32 WHEN 'CS203' THEN 30 ELSE 25 END
FROM students s, subjects sub
WHERE s.student_id = 'STU001' AND sub.subject_code IN ('CS201','CS202','CS203')
ON CONFLICT DO NOTHING;

-- Seed: marks for student 1
INSERT INTO marks (student_id, subject_id, internal_marks, assignment_marks, exam_marks)
SELECT s.id, sub.id,
  CASE sub.subject_code WHEN 'CS201' THEN 18 WHEN 'CS202' THEN 16 WHEN 'CS203' THEN 17 ELSE 15 END,
  CASE sub.subject_code WHEN 'CS201' THEN 9 WHEN 'CS202' THEN 8 WHEN 'CS203' THEN 9 ELSE 7 END,
  CASE sub.subject_code WHEN 'CS201' THEN 38 WHEN 'CS202' THEN 35 WHEN 'CS203' THEN 33 ELSE 30 END
FROM students s, subjects sub
WHERE s.student_id = 'STU001' AND sub.subject_code IN ('CS201','CS202','CS203')
ON CONFLICT DO NOTHING;

-- Seed: assignments for student 1
INSERT INTO assignments (student_id, subject_id, title, status, marks_awarded, max_marks, due_date, submitted_date)
SELECT s.id, sub.id,
  CASE sub.subject_code WHEN 'CS201' THEN 'Linked List Implementation' WHEN 'CS202' THEN 'ER Diagram Project' ELSE 'Socket Programming' END,
  CASE sub.subject_code WHEN 'CS201' THEN 'Submitted' WHEN 'CS202' THEN 'Submitted' ELSE 'Pending' END,
  CASE sub.subject_code WHEN 'CS201' THEN 45 WHEN 'CS202' THEN 42 ELSE 0 END,
  50,
  '2025-09-15'::date,
  CASE WHEN sub.subject_code = 'CS203' THEN NULL ELSE '2025-09-14'::date END
FROM students s, subjects sub
WHERE s.student_id = 'STU001' AND sub.subject_code IN ('CS201','CS202','CS203')
ON CONFLICT DO NOTHING;
