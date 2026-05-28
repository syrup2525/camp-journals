import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { JournalDetailPage } from './pages/JournalDetailPage';
import { JournalFormPage } from './pages/JournalFormPage';
import { JournalListPage } from './pages/JournalListPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<JournalListPage />} />
        <Route path="/journals/:id" element={<JournalDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/journals/new"
          element={
            <ProtectedRoute>
              <JournalFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journals/:id/edit"
          element={
            <ProtectedRoute>
              <JournalFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

