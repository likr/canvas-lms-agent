# Teacher & Administrator Guide - Canvas LMS Skill

This guide outlines common tasks and workflows for **Teachers, TAs, and Administrators**. Instructors have full write privileges to build courses, manage enrollments, grade submissions, and run analytics reports.

---

## Key Workflows & Guidelines

### 1. Build and Structure Courses
To design course syllabus structure, upload files, define modules, and construct pages:
- Create and organize modules using `post_courses_course_id_modules` and `put_courses_course_id_modules_id`.
- Create lecture content or pages using `post_courses_course_id_pages` and `put_courses_course_id_pages_url_or_id`.
- Upload course materials and inspect files using `get_courses_course_id_files`.
- Reference the detailed guide for Courses & Modules:
  - **See Details**: [courses_and_modules.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/courses_and_modules.md)

### 2. Design Assignments & Quizzes
To create assessment activities, define grading parameters, and publish quizzes:
- Create assignments using `post_courses_course_id_assignments` and update parameters (due dates, points, submission types) with `put_courses_course_id_assignments_id`.
- Setup quizzes and question groups using `post_courses_course_id_quizzes`, `put_courses_course_id_quizzes_id`, or `post_courses_course_id_quizzes_quiz_id_questions`.
- Reference the detailed guide for Assignments & Quizzes:
  - **See Details**: [assignments_and_quizzes.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/assignments_and_quizzes.md)

### 3. Evaluate Submissions & Manage Grades
To review student submissions, give scores, and provide textual feedback:
- **Retrieve All Grades**: When calling `get_courses_course_id_students_submissions`, ensure you pass `student_ids[]=all` (or a specific student ID) to fetch grades for your student roster.
- **Grade & Comment**: Call `put_courses_course_id_assignments_assignment_id_submissions_user_id` with the specific student's `user_id` to post a grade or write feedback. Do not pass the teacher's own user ID.
- Check specific student files or submissions using `get_courses_course_id_assignments_assignment_id_submissions_user_id`.
- Reference the detailed guide for Submissions & Grades:
  - **See Details**: [submissions_and_grades.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/submissions_and_grades.md)

### 4. Direct Class Communications & Group Assignments
To send announcements, manage class discussions, and assign groups:
- Post announcements (which are discussion topics with `only_announcements=true` or via dedicated wrappers) using `post_courses_course_id_discussion_topics`.
- Set up student project groups and categories using `post_groups` and `post_courses_course_id_group_categories`.
- Message students individually or in groups using `post_conversations`.
- Reference the detailed guide for Communication & Groups:
  - **See Details**: [communication_and_groups.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/communication_and_groups.md)

### 5. Advanced Administration, Reporting, and Analytics
To import student lists, migration data, run backups, or check page hit activity:
- Run account-wide or course-wide reports using `post_accounts_account_id_reports_report` and `post_courses_course_id_reports_report_type`.
- Import student records or section info via SIS using `post_accounts_account_id_sis_imports`.
- Monitor course progress, check student activity or class grade distributions using `get_courses_course_id_analytics_activity` or `get_courses_course_id_analytics_assignments`.
- Manage blueprint course templates and migrations.
- Reference the detailed guide for Accounts & Admin:
  - **See Details**: [accounts_and_admin.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/accounts_and_admin.md)

### 6. User Enrolment & Customizations
To search course rosters, manage sections, or adjust feature flags:
- Find students and retrieve their IDs using `get_courses_course_id_users`.
- Check or enroll users into sections using `get_courses_course_id_sections` and `get_courses_course_id_enrollments`.
- Reference the detailed guide for User Settings & Customizations:
  - **See Details**: [users_and_customizations.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/users_and_customizations.md)
