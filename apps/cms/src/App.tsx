import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Layout
import { CmsLayout } from './components/layout/CmsLayout';
import { DashboardPage } from './components/layout/DashboardPage';

// Auth
import { LoginPage } from './components/auth/LoginPage';

// Courses
import { CourseListPage } from './components/courses/CourseListPage';
import { CourseForm } from './components/courses/CourseForm';

// Topics
import { TopicListPage } from './components/topics/TopicListPage';
import { TopicForm } from './components/topics/TopicForm';

// Themes
import { ThemeListPage } from './components/themes/ThemeListPage';
import { ThemeForm } from './components/themes/ThemeForm';

// Lessons
import { LessonListPage } from './components/lessons/LessonListPage';
import { LessonForm } from './components/lessons/LessonForm';

// Kids
import { KidListPage } from './components/kids/KidListPage';
import { KidForm } from './components/kids/KidForm';

// Passwords
import { PasswordListPage } from './components/passwords/PasswordListPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/cms">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected (auth guard is inside CmsLayout) */}
          <Route element={<CmsLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Courses */}
            <Route path="courses" element={<CourseListPage />} />
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:id" element={<CourseForm />} />

            {/* Topics */}
            <Route path="topics" element={<TopicListPage />} />
            <Route path="topics/new" element={<TopicForm />} />
            <Route path="topics/:id" element={<TopicForm />} />

            {/* Themes */}
            <Route path="themes" element={<ThemeListPage />} />
            <Route path="themes/new" element={<ThemeForm />} />
            <Route path="themes/:id" element={<ThemeForm />} />

            {/* Lessons */}
            <Route path="lessons" element={<LessonListPage />} />
            <Route path="lessons/new" element={<LessonForm />} />
            <Route path="lessons/:id" element={<LessonForm />} />

            {/* Kids */}
            <Route path="kids" element={<KidListPage />} />
            <Route path="kids/new" element={<KidForm />} />
            <Route path="kids/:id" element={<KidForm />} />

            {/* Passwords */}
            <Route path="passwords" element={<PasswordListPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
