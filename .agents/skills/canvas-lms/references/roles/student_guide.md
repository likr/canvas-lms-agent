# Student Guide - Canvas LMS Skill

This guide outlines common tasks and workflows for **Students**. As a student, your actions are typically read-only for course structures, but include write actions for submitting assignments, replying to discussions, and managing personal settings.

---

## Key Workflows & Guidelines

### 1. View Courses, Modules, and Course Content
To browse the syllabus, download files, or check module progression:
- Use `get_courses` to find active course IDs.
- Use `get_courses_course_id_modules` with `include_items: true` to get the structured list of modules and inline items.
- Reference the detailed guide for Courses & Modules:
  - **See Details**: [courses_and_modules.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/courses_and_modules.md)

### 2. View Assignments & Take Quizzes
To check upcoming tasks, deadlines, and take online quizzes:
- Retrieve assignments using `get_courses_course_id_assignments` or `get_courses_course_id_assignments_id`.
- Check quizzes using `get_courses_course_id_quizzes` or `get_quiz`.
- Reference the detailed guide for Assignments & Quizzes:
  - **See Details**: [assignments_and_quizzes.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/assignments_and_quizzes.md)

### 3. Submit Assignments & Check Grades
To submit work and view grades or instructor feedback:
- Submit assignments using `post_courses_course_id_assignments_assignment_id_submissions`.
- **Retrieve Personal Grades**: Call `get_courses_course_id_students_submissions` *without* passing any `student_id`. This automatically returns the grades and submissions for the calling student.
- Reference the detailed guide for Submissions & Grades:
  - **See Details**: [submissions_and_grades.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/submissions_and_grades.md)

### 4. Communication & Collaborative Activities
To check announcements, join discussions, or message instructors/peers:
- Read class announcements using `get_announcements`.
- Check or reply to discussions using `get_courses_course_id_discussion_topics` and `post_courses_course_id_discussion_topics`.
- Direct message people using `post_conversations` or `get_conversations`.
- Reference the detailed guide for Communication & Groups:
  - **See Details**: [communication_and_groups.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/communication_and_groups.md)

### 5. Personal Planning & Settings
To manage your schedule, notification preferences, or planner:
- Use `get_calendar_events` to retrieve deadlines and class sessions.
- Reference the detailed guide for User Settings & Customizations:
  - **See Details**: [users_and_customizations.md](file:///home/likr/work/likr/canvas-lms-agent/.agents/skills/canvas-lms/references/features/users_and_customizations.md)
