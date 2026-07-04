# Courses & Modules Reference - Canvas LMS

This reference guide covers operations related to courses, sections, enrollments, learning modules, wiki pages, files, and rubrics.

---

## Courses, Sections & Enrollments

### 1. View Courses
- **`get_courses`**: Lists the active courses for the authenticated user.
  - *Returns*: A list of Course objects (including `id`, `name`, `course_code`).
  - *Usage*: Use this at the beginning of any workflow to resolve course IDs.
- **`get_courses_id`**: Retrieves details of a specific course.
  - *Parameters*: `id` (Course ID).

### 2. Sections & Enrollments
- **`get_courses_course_id_sections`**: Lists all sections in a course.
  - *Parameters*: `course_id`.
  - *Usage*: Essential for managing students grouped by sections.
- **`get_courses_course_id_enrollments`**: Lists all enrollments in a course or section.
  - *Parameters*: `course_id`, `type[]` (e.g. `StudentEnrollment`, `TeacherEnrollment`, `TaEnrollment`), `state[]` (e.g. `active`).
  - *Usage*: Used to inspect who is enrolled in what capacity.

---

## Modules

Modules group course materials (assignments, files, pages, URLs) into learning sequences.

### 1. View Modules
- **`get_courses_course_id_modules`**: Lists modules in a course.
  - *Parameters*: `course_id`, `include[]` (Pass `"items"` to get inline items inside the modules, which contains item IDs, types, and content titles).
  - *Usage*: Always include `include[]=items` when searching for specific module items.
- **`get_module`**: Retrieves details for a specific module.
  - *Parameters*: `course_id`, `id` (Module ID).

### 2. Manage Modules (Teacher Only)
- **`post_courses_course_id_modules`**: Creates a new module.
  - *Parameters*: `course_id`, `module[name]`, `module[unlock_at]`, `module[position]`.
- **`put_courses_course_id_modules_id`**: Updates an existing module.
  - *Parameters*: `course_id`, `id`, `module[name]`, `module[published]`.
- **`delete_module`**: Deletes a module.
  - *Parameters*: `course_id`, `id`.

---

## Pages (Wiki Pages)

Wiki pages contain lecture notes, syllabus pages, and informational text.

### 1. View Pages
- **`get_courses_course_id_pages`**: Lists wiki pages in a course.
  - *Parameters*: `course_id`.
- **`get_courses_course_id_pages_url_or_id`**: Retrieves the detailed content (HTML body) of a page.
  - *Parameters*: `course_id`, `url_or_id` (The URL slug or page ID).
  - *Usage*: Mandatory to read course details or syllabus details if they are hosted on a wiki page.

### 2. Manage Pages (Teacher Only)
- **`post_courses_course_id_pages`**: Creates a new wiki page.
  - *Parameters*: `course_id`, `wiki_page[title]`, `wiki_page[body]`, `wiki_page[published]`.
- **`put_courses_course_id_pages_url_or_id`**: Updates an existing wiki page.
  - *Parameters*: `course_id`, `url_or_id`, `wiki_page[body]`, `wiki_page[title]`.
- **`delete_page`**: Deletes a wiki page.
  - *Parameters*: `course_id`, `url_or_id`.

---

## Files & Rubrics

### 1. Files
- **`get_courses_course_id_files`**: Lists files uploaded to a course.
  - *Parameters*: `course_id`, `search_term` (Optional filter).
  - *Usage*: Use to locate lecture slides, PDFs, syllabus files, etc.

### 2. Rubrics
- **`get_courses_course_id_rubrics`**: Lists rubrics associated with a course.
  - *Parameters*: `course_id`.
  - *Usage*: Read to understand assessment criteria for assignments in the course.
