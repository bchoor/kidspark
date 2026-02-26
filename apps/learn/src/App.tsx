import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './hooks/useSession';

// Auth
import { PasswordGate } from './components/auth/PasswordGate';

// Layout
import { LearnLayout } from './components/layout/LearnLayout';

// Courses
import { CourseSelector } from './components/courses/CourseSelector';
import { CourseLessonsPage } from './components/courses/CourseLessonsPage';

// Lessons
import { LessonViewer } from './components/lessons/LessonViewer';

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          {/* Password gate — public */}
          <Route path="/" element={<PasswordGate />} />

          {/* Authenticated learn app */}
          <Route element={<LearnLayout />}>
            <Route path="/courses" element={<CourseSelector />} />
            <Route path="/courses/:slug" element={<CourseLessonsPage />} />
            <Route path="/lessons/:id" element={<LessonViewer />} />
            <Route path="*" element={<Navigate to="/courses" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
